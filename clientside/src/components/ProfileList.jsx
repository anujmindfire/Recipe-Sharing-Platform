import React, { useState, useEffect, useCallback } from 'react';
import styles from '../styles/profileList.module.css';
import Loader from '../components/Loader';
import ErrorModal from '../components/ErrorModal';
import Snackbar from '../components/Snackbar';
import FollowNotification from '../components/FollowNotification';
import { backendURL } from '../api/url';
import { refreshAccessToken } from '../utils/tokenServices';
import { useNavigate, useLocation } from 'react-router-dom';
import withAuthentication from '../utils/withAuthenicate';
import { io } from 'socket.io-client';

const ProfileList = () => {
    const [profilesData, setProfilesData] = useState({
        profiles: [],
        page: 1,
        totalPages: 1,
        searchQuery: '',
        notFound: false,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [notifications, setNotifications] = useState([]);

    const accesstoken = localStorage.getItem('accesstoken');
    const refreshtoken = localStorage.getItem('refreshtoken');
    const userId = localStorage.getItem('id');
    const navigate = useNavigate();
    const location = useLocation();

    const defaultProfilePicture = 'https://imgv3.fotor.com/images/blog-cover-image/10-profile-picture-ideas-to-make-you-stand-out.jpg';

    const fetchProfiles = useCallback(async () => {
        try {
            setIsLoading(true);
            let response;
            const pathMap = {
                '/profile/list': { allUser: true },
                '/profile/following': { following: true },
                '/profile/follower': { follower: true },
            };

            const queryParams = pathMap[location.pathname];

            if (queryParams) {
                const url = `${backendURL}/user?${new URLSearchParams({
                    ...queryParams,
                    limit: 20,
                    page: profilesData.page,
                    searchKey: profilesData.searchQuery,
                })}`;

                response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        accesstoken,
                        id: userId,
                    },
                });
            }

            const data = await response.json();
            if (response.ok && data.data) {
                const updatedProfiles = data.data.map(profile => ({
                    ...profile,
                    profileImage: profile.profileImage || defaultProfilePicture,
                }));

                const uniqueProfiles = new Map();
                updatedProfiles.forEach(profile => {
                    uniqueProfiles.set(profile._id, profile);
                });

                setProfilesData(prevData => ({
                    ...prevData,
                    profiles: Array.from(uniqueProfiles.values()),
                    totalPages: Math.ceil(data.total / 20),
                    notFound: updatedProfiles.length === 0,
                }));
            } else if (response.status === 401 || data.unauthorized) {
                const newAccessToken = await refreshAccessToken(refreshtoken, userId, navigate);
                if (newAccessToken) {
                    await fetchProfiles();
                }
            } else {
                setError({ message: data.message });
            }
        } catch (error) {
            setError({ message: error.message });
        } finally {
            setIsLoading(false);
        }
    }, [profilesData.page, profilesData.searchQuery, accesstoken, refreshtoken, userId, navigate, location.pathname, defaultProfilePicture]);

    useEffect(() => {
        fetchProfiles();
    }, [profilesData.page, fetchProfiles]);

    useEffect(() => {
        const socket = io('https://recipe-sharing-platform-zeta.vercel.app');
        socket.on('connect', () => {
            console.log('Connected to Socket.IO server with ID:', socket.id);
            const userId = localStorage.getItem('id');
            if (userId) {
                socket.emit('join', userId);
                console.log(`User with ID: ${userId} joined the room`);
            }
        });

        socket.on('notification', (data) => {
            console.log('Received notification:', data);
            setNotifications(prevNotifications => [...prevNotifications, data.message]);
        });

        return () => {
            socket.off('notification');
        };
    }, []);

    const handleSearchChange = (e) => {
        setProfilesData({
            ...profilesData,
            searchQuery: e.target.value,
            page: 1,
            profiles: [],
        });
    };

    const handleErrorModalClose = () => {
        setError(null);
    };

    const handleSnackbarClose = () => {
        setShowSnackbar(false);
    };

    const handleFollowAndUnFollowClick = async (profileId, isFollowing) => {
        try {
            const followAction = isFollowing ? false : true;
            let unfollowBody = false;
            if (location.pathname === '/profile/follower') {
                unfollowBody = true;
            }
            let response = await fetch(`${backendURL}/follow`, {
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
                setSnackbarMessage(data.message);
                setShowSnackbar(true);
                setTimeout(() => {
                    fetchProfiles();
                }, 1000);
            } else if (response.status === 401 || data.unauthorized) {
                const newAccessToken = await refreshAccessToken(refreshtoken, userId, navigate);
                if (newAccessToken) {
                    await fetchProfiles();
                }
            }
        } catch (error) {
            setError({ message: error.message });
        }
    };

    return (
        <div className={styles.profileList}>
            <div className={styles.searchFilterContainer}>
                <div className={styles.searchWrapper}>
                    <form className={styles.searchBar}>
                        <input
                            type='text'
                            name='query'
                            className={styles.searchInput}
                            placeholder='Search users...'
                            value={profilesData.searchQuery}
                            onChange={handleSearchChange}
                        />
                    </form>
                </div>
            </div>

            <section className={styles.profileList}>
                {profilesData.profiles.length > 0 ? (
                    profilesData.profiles.map((profile) => (
                        <article key={profile._id} className={styles.profileCard}>
                            <div className={styles.profileInfo}>
                                <img
                                    src={profile.profileImage}
                                    alt={profile.name}
                                    className={styles.profileImage}
                                />
                                <div className={styles.textContainer}>
                                    <h2 className={styles.profileName}>{profile.name}</h2>
                                </div>
                            </div>
                            <div className={styles.followButtonContainer}>
                                <button
                                    className={styles.button}
                                    onClick={() => handleFollowAndUnFollowClick(profile._id, location.pathname === '/profile/following' || location.pathname === '/profile/follower')}
                                >
                                    <span className={styles.buttonText}>
                                        {location.pathname === '/profile/following' || location.pathname === '/profile/follower' ? 'Unfollow' : 'Follow'}
                                    </span>
                                </button>
                            </div>
                        </article>
                    ))
                ) : profilesData.notFound ? (
                    <p className={styles.noDataMessage}>No users found</p>
                ) : null}

                {error && <ErrorModal message={error.message} onClose={handleErrorModalClose} />}
                {isLoading && !profilesData.notFound && <Loader className={styles.loaderContainer} />}
            </section>
            {/* <FollowNotification
                isVisible={showNotificationSidebar}
                closeSidebar={() => setShowNotificationSidebar(false)}
                notifications={notifications}
            /> */}
            <FollowNotification notifications={notifications} /> {/* Render NotificationDisplay */}
            <Snackbar isVisible={showSnackbar} onClose={handleSnackbarClose} message={snackbarMessage} />
        </div>
    );
};

export default withAuthentication(ProfileList);
