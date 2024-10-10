import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from '../styles/chatSidebar.module.css';
import Loader from '../components/Loader';
import SearchFilterBar from '../components/SearchFilterBar';
import Message from './Message';
import { backendURL } from '../api/url';
import { refreshAccessToken } from '../utils/tokenServices';
import withAuthentication from '../utils/withAuthenicate';
import { useNavigate } from 'react-router-dom';

const ChatSidebar = () => {
    const [users, setUsers] = useState({
        profiles: [],
        totalPages: 0,
        page: 1,
        isLoading: false,
        errorMessage: '',
        showErrorModal: false,
        searchParams: { query: '' },
        notFound: false,
    });
    const [selectedChatUser, setSelectedChatUser] = useState(null);

    const accesstoken = localStorage.getItem('accesstoken');
    const refreshtoken = localStorage.getItem('refreshtoken');
    const userId = localStorage.getItem('id');
    const defaultProfilePicture = 'https://imgv3.fotor.com/images/blog-cover-image/10-profile-picture-ideas-to-make-you-stand-out.jpg';
    const navigate = useNavigate();
    const mainContentRef = useRef(null);

    const handleFetchError = useCallback((data, response) => {
        if (response.status === 401 || data.unauthorized) {
            return refreshAccessToken(refreshtoken, userId, navigate);
        } else if (data.message) {
            setUsers((prev) => ({ ...prev, errorMessage: data.message, showErrorModal: true }));
        }
    }, [userId, navigate, refreshtoken]);

    const handleChatOpen = (user) => {
        setSelectedChatUser(user);
        localStorage.setItem('selectedChatUserId', user._id);
    };

    const fetchProfiles = useCallback(async () => {
        setUsers((prevState) => ({ ...prevState, isLoading: true, showErrorModal: false }));

        const { query } = users.searchParams;
        try {
            const queryParams = { allUser: true };

            const url = `${backendURL}/user?${new URLSearchParams({
                ...queryParams,
                limit: 20,
                page: users.page,
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

                setUsers(prevData => ({
                    ...prevData,
                    profiles: prevData.page === 1 ? uniqueProfiles : [...prevData.profiles, ...uniqueProfiles],
                    totalPages: Math.ceil(data.total / 20),
                    notFound: uniqueProfiles.length === 0,
                }));
            } else {
                handleFetchError(data, response);
            }
        } catch (error) {
            setUsers((prev) => ({
                ...prev,
                errorMessage: 'Something went wrong while fetching profiles.',
                showErrorModal: true,
            }));
        } finally {
            setUsers((prev) => ({ ...prev, isLoading: false }));
        }
    }, [users.page, users.searchParams, accesstoken, userId, handleFetchError]);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleScroll = useCallback(() => {
        if (mainContentRef.current) {
            const bottom = mainContentRef.current.scrollHeight - mainContentRef.current.scrollTop <= mainContentRef.current.clientHeight + 1;
            if (bottom && !users.isLoading && users.page < users.totalPages) {
                setUsers((prev) => ({ ...prev, page: prev.page + 1 }));
            }
        }
    }, [users.isLoading, users.page, users.totalPages]);

    useEffect(() => {
        const contentRef = mainContentRef.current;
        if (contentRef) {
            contentRef.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (contentRef) {
                contentRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll]);

    const handleSearchChange = (e) => {
        const { value } = e.target;
        setUsers((prevState) => ({
            ...prevState,
            searchParams: { ...prevState.searchParams, query: value },
            page: 1,
            profiles: [],
        }));
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const storedChatUserId = localStorage.getItem('selectedChatUserId');
        if (storedChatUserId) {
            const storedChatUser = users.profiles.find(user => user._id === storedChatUserId);
            if (storedChatUser) {
                setSelectedChatUser(storedChatUser);
            }
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [users.profiles]);

    return (
        <div className={styles.chatContainer}>
            <aside className={`${styles.sidebar} ${styles.scrollContainer}`} ref={mainContentRef}>
                <SearchFilterBar
                    searchParams={users.searchParams}
                    handleSearchChange={handleSearchChange}
                    placeholder='Search Users...'
                />
                <nav>
                    <ul>
                        {users.isLoading ? (
                            <Loader />
                        ) : users.notFound ? (
                            <p className={styles.noDataMessage}>No profiles found</p>
                        ) : users.profiles && users.profiles.length > 0 ? (
                            users.profiles.map((user) => (
                                <li key={user._id} className={styles.userListItem}>
                                    <div className={styles.userInfo}>
                                        <img
                                            loading="lazy"
                                            src={user.profileImage || defaultProfilePicture}
                                            className={styles.userAvatar}
                                            alt={`${user.name}'s avatar`}
                                        />
                                        <div className={styles.userName}>{user.name}</div>
                                    </div>
                                    <div className={styles.userActionWrapper}>
                                        <button
                                            className={styles.userActionButton}
                                            aria-label={`Chat with ${user.name}`}
                                            onClick={() => handleChatOpen(user)}
                                        >
                                            <img
                                                loading="lazy"
                                                src={'https://cdn.builder.io/api/v1/image/assets/TEMP/f8aa5864f4496088c34969bd03fb7653ad0f1755b36b6d1430a30d71f97c216b?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca'}
                                                className={styles.icon}
                                                alt="Chat icon"
                                            />
                                        </button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className={styles.noDataMessage}>No profiles found</p>
                        )}
                    </ul>
                </nav>
            </aside>

            {selectedChatUser && (
                <div className={styles.chatWindow}>
                    <Message sender={userId} receiver={selectedChatUser._id} receiverName={selectedChatUser.name}/>
                </div>
            )}
        </div>
    );
}

export default withAuthentication(ChatSidebar);
