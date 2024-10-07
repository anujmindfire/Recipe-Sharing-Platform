import React, { useEffect, useState } from 'react';
import withAuthentication from '../utils/withAuthenicate';
import { backendURL } from '../api/url';
import Loader from '../components/Loader';
import Snackbar from '../components/Snackbar';
import ErrorModal from '../components/ErrorModal';
import Button from '../components/Button';
import styles from '../styles/shareMessage.module.css';
import { io } from 'socket.io-client';
import FollowNotification from './FollowNotification';

const ShareMessage = () => {
    const [followers, setFollowers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [selectedFollower, setSelectedFollower] = useState('');
    const [message, setMessage] = useState('');

    const accesstoken = localStorage.getItem('accesstoken');
    const userId = localStorage.getItem('id');

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const response = await fetch(`${backendURL}/user?follower=true`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        accesstoken,
                        id: userId,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setFollowers(data.data);
                    } else {
                        setNotFound(true);
                    }
                } else {
                    setNotFound(true);
                }
            } catch (error) {
                setErrorMessage('Error fetching followers');
                setShowErrorModal(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFollowers();

        const socket = io('https://recipe-sharing-platform-zeta.vercel.app');
        socket.on('connect', () => {
            console.log('Connected to Socket.IO server with ID:', socket.id);
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
    }, [userId, accesstoken]);

    const handleSnackbarClose = () => {
        setShowSnackbar(false);
    };

    const handleErrorModalClose = () => {
        setShowErrorModal(false);
    };

    const handleSendMessage = async () => {
        if (!selectedFollower || !message) {
            setErrorMessage('Please select a follower and enter a message.');
            setShowErrorModal(true);
            return;
        }

        try {
            const response = await fetch(`${backendURL}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accesstoken': localStorage.getItem('accesstoken'),
                    'id': localStorage.getItem('id'),
                },
                body: JSON.stringify({
                    userId: selectedFollower,
                    title: message,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Message sent successfully:', data);
                setShowSnackbar(true); // Show confirmation snackbar
                setMessage(''); // Clear the message input
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Error sending message');
                setShowErrorModal(true);
            }
        } catch (error) {
            setErrorMessage('Error sending message');
            setShowErrorModal(true);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.followerDropdown}>
                <label htmlFor="followers">Select Follower:</label>
                <select
                    id="followers"
                    value={selectedFollower}
                    onChange={(e) => setSelectedFollower(e.target.value)}
                >
                    <option value="">Select a follower</option>
                    {followers.map(follower => (
                        <option key={follower._id} value={follower._id}>
                            {follower.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className={styles.messageInput}>
                <label htmlFor="message">Message:</label>
                <input
                    id="message"
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here"
                />
            </div>
            <Button className={styles.button} variant='primary' onClick={handleSendMessage}>
                Send Message
            </Button>
            {isLoading && !notFound && <Loader className={styles.loaderContainer} />}
            <FollowNotification notifications={notifications} />
            <Snackbar isVisible={showSnackbar} onClose={handleSnackbarClose} />
            {showErrorModal && <ErrorModal message={errorMessage} onClose={handleErrorModalClose} />}
        </div>
    );
};

export default withAuthentication(ShareMessage);
