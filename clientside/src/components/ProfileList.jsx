import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styles from '../styles/profileList.module.css';
import Loader from '../components/Loader';
import ErrorModal from '../components/ErrorModal';
import Snackbar from '../components/Snackbar';
import SearchFilterBar from '../components/SearchFilterBar';
import { backendURL } from '../api/url';
import { refreshAccessToken } from '../utils/tokenServices';
import { useNavigate, useLocation } from 'react-router-dom';
import withAuthentication from '../utils/withAuthenicate';
import { io } from 'socket.io-client';
import Notification from './Notification';

const ProfileList = () => {
    const initialSearchParams = useMemo(() => ({
        query: '',
    }), []);

    const [status, setStatus] = useState({
        profiles: [],
        totalPages: 0,
        page: 1,
        isLoading: false,
        errorMessage: '',
        showErrorModal: false,
        searchParams: initialSearchParams,
        notFound: false
    });

    const [showSnackbar, setShowSnackbar] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    const { totalPages, page, isLoading, errorMessage, showErrorModal, searchParams, notFound } = status;

    const accesstoken = localStorage.getItem('accesstoken');
    const refreshtoken = localStorage.getItem('refreshtoken');
    const userId = localStorage.getItem('id');

    const location = useLocation();
    const navigate = useNavigate();
    const mainContentRef = useRef(null);

    const defaultProfilePicture = 'https://imgv3.fotor.com/images/blog-cover-image/10-profile-picture-ideas-to-make-you-stand-out.jpg';

    const handleFetchError = useCallback((data, response) => {
        if (response.status === 401 || data.unauthorized) {
            return refreshAccessToken(refreshtoken, userId, navigate);
        } else if (data.message) {
            setStatus((prev) => ({ ...prev, errorMessage: data.message, showErrorModal: true }));
        }
    }, [userId, navigate, refreshtoken]);

    const fetchProfiles = useCallback(async () => {
        setStatus((prevState) => ({ ...prevState, isLoading: true, showErrorModal: false }));
        const { query } = searchParams;
        try {
            const pathMap = {
                '/profile/list': { allUser: true },
                '/profile/following': { following: true },
                '/profile/follower': { follower: true },
            };

            const queryParams = pathMap[location.pathname];
            if (!queryParams) return;

            const url = `${backendURL}/user?${new URLSearchParams({
                ...queryParams,
                limit: 20,
                page: page,
                searchKey: query,
            })}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    accesstoken,
                    id: userId,
                },
            });

            const data = await response.json();
            if (response.ok && data.data) {
                const updatedProfiles = data.data.map(profile => ({
                    ...profile,
                    profileImage: profile.profileImage || defaultProfilePicture,
                }));

                const uniqueProfiles = Array.from(new Map(updatedProfiles.map(profile => [profile._id, profile])).values());

                setStatus(prevData => ({
                    ...prevData,
                    profiles: uniqueProfiles,
                    totalPages: Math.ceil(data.total / 20),
                    notFound: uniqueProfiles.length === 0,
                }));
            } else {
                handleFetchError(data, response);
            }
        } catch (error) {
            setStatus((prev) => ({ ...prev, errorMessage: 'Something went wrong while fetching profiles.', showErrorModal: true }));
        } finally {
            setStatus((prev) => ({ ...prev, isLoading: false }));
        }
    }, [page, searchParams, accesstoken, userId, handleFetchError, location.pathname, defaultProfilePicture]);

    useEffect(() => {
        setStatus((prev) => ({
            ...prev,
            searchParams: initialSearchParams,
            page: 1,
            profiles: [],
            notFound: false,
        }));
        window.scrollTo(0, 0);
    }, [location.pathname, initialSearchParams]);

    useEffect(() => {
        fetchProfiles();
    }, [page, searchParams, fetchProfiles]);

    useEffect(() => {
        const handleScroll = () => {
            if (mainContentRef.current) {
                const bottom = mainContentRef.current.scrollHeight - mainContentRef.current.scrollTop <= mainContentRef.current.clientHeight + 1;
                if (bottom && !isLoading && page < totalPages) {
                    setStatus((prev) => ({ ...prev, page: prev.page + 1 }));
                }
            }
        };

        const currentRef = mainContentRef.current;

        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isLoading, page, totalPages]);

    useEffect(() => {
        const socket = io('https://foodie-backend-wi9m.onrender.com');

        socket.on('connect', () => {
            const userId = localStorage.getItem('id');
            if (userId) {
                socket.emit('join', userId);
            }
        });

        socket.on('notification', (data) => {
            if (data.message) {
                setNotifications((prevNotifications) => [
                    ...prevNotifications,
                    { message: data.message },
                ]);
            }
        });

        return () => {
            socket.off('notification');
        };
    }, []);

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setStatus((prevState) => ({
            ...prevState,
            searchParams: { ...prevState.searchParams, [name]: value },
            page: 1,
            profiles: [],
        }));
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleFollowAndUnFollowClick = async (profileId, isFollowing, unfollow) => {
        setStatus((prevState) => ({ ...prevState, isLoading: true, showErrorModal: false }));
        try {
            const followAction = !isFollowing;
            const unfollowBody = unfollow ? unfollow : location.pathname === '/profile/follower';

            const response = await fetch(`${backendURL}/follow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    accesstoken,
                    id: userId,
                },
                body: JSON.stringify({
                    followerId: userId,
                    followedId: profileId,
                    follow: unfollowBody ? false : followAction,
                    unfollowBody
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccessMessage(data.message);
                setShowSnackbar(true);
                setTimeout(() => window.location.reload(), 1000);
            } else {
                handleFetchError(data, response);
            }
        } catch (error) {
            setStatus((prev) => ({ ...prev, errorMessage: 'Something went wrong while updating follow status.', showErrorModal: true }));
        } finally {
            setStatus((prev) => ({ ...prev, isLoading: false }));
        }
    };

    const handleErrorModalClose = () => setStatus((prev) => ({ ...prev, showErrorModal: false, errorMessage: '' }));

    return (
        <div className={`${styles.profileList} ${styles.scrollContainer}`} ref={mainContentRef}>
            <SearchFilterBar
                searchParams={searchParams}
                handleSearchChange={handleSearchChange}
                uniquePrepTimes={[]}
                uniqueCookTimes={[]}
                placeholder='Search Users...'
            />

            <div className={styles.notificationContainer}>
                <button
                    aria-label="Notifications"
                    onClick={toggleSidebar}
                >
                    <img
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/d38291a9b11a8859d48e42f8f0acddefed86e9d4a9f526bdd03b4d73321cd8f7?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca"
                        alt="Notifications"
                    />
                </button>
            </div>
            <section className={styles.profileList}>
                {isLoading ? (
                    <Loader />
                ) : notFound ? (
                    <p className={styles.noDataMessage}>No profiles found</p>
                ) : status.profiles.length > 0 ? (
                    status.profiles.map(profile => (
                        <article key={profile._id} className={styles.profileCard}>
                            <div className={styles.profileInfo}>
                                <img
                                    src={profile.profileImage}
                                    alt={profile.name}
                                    className={styles.profileImage}
                                />
                                <div className={styles.textContainer}>
                                    <h2>{profile.name}</h2>
                                </div>
                            </div>
                            {location.pathname === '/profile/list' ? (
                                <>
                                    {profile.unfollow && profile.followback && !profile.follow && (
                                        <>
                                            <button
                                                className={styles.button}
                                                onClick={() => handleFollowAndUnFollowClick(profile._id, true, true)}
                                            >
                                                <span className={styles.buttonText}>Unfollow</span>
                                            </button>
                                            <button
                                                className={styles.button}
                                                onClick={() => handleFollowAndUnFollowClick(profile._id, false)}
                                            >
                                                <span className={styles.buttonText}>Follow Back</span>
                                            </button>
                                        </>
                                    )}

                                    {profile.unfollow && !profile.followback && !profile.follow && (
                                        <button
                                            className={styles.button}
                                            onClick={() => handleFollowAndUnFollowClick(profile._id, true)}
                                        >
                                            <span className={styles.buttonText}>Unfollow</span>
                                        </button>
                                    )}

                                    {!profile.unfollow && !profile.followback && profile.follow && (
                                        <button
                                            className={styles.button}
                                            onClick={() => handleFollowAndUnFollowClick(profile._id, false)}
                                        >
                                            <span className={styles.buttonText}>Follow</span>
                                        </button>
                                    )}
                                </>
                            ) : (location.pathname === '/profile/following' || location.pathname === '/profile/follower') && (
                                <button
                                    className={styles.button}
                                    onClick={() => handleFollowAndUnFollowClick(profile._id, true)}
                                >
                                    <span className={styles.buttonText}>Unfollow</span>
                                </button>
                            )}

                        </article>
                    ))
                ) : (
                    <p className={styles.noDataMessage}>No profiles found</p>
                )}
            </section>
            {showErrorModal && <ErrorModal onClose={handleErrorModalClose} message={errorMessage} />}
            <Snackbar isVisible={showSnackbar} onClose={() => setShowSnackbar(false)} message={successMessage} />
            <Notification
                isOpen={isSidebarOpen}
                onClose={toggleSidebar}
                notifications={notifications}
            />
        </div>
    );
};

export default withAuthentication(ProfileList);