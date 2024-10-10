import React, { useState, useEffect, useCallback } from 'react';
import styles from '../styles/message.module.css';
import Loader from './Loader';
import { backendURL } from '../api/url';
import { refreshAccessToken } from '../utils/tokenServices';
import { useNavigate } from 'react-router-dom';

const Message = ({ sender, receiver, receiverName }) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const accesstoken = localStorage.getItem('accesstoken');
    const refreshtoken = localStorage.getItem('refreshtoken');
    const userId = localStorage.getItem('id');
    const navigate = useNavigate();

    const handleFetchError = useCallback((data, response) => {
        if (response.status === 401 || data.unauthorized) {
            return refreshAccessToken(refreshtoken, userId, navigate);
        } else if (data.message) {
            setErrorMessage(data.message);
        }
    }, [userId, navigate, refreshtoken]);

    const fetchMessages = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const response = await fetch(`${backendURL}/chat/${sender}/${receiver}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    accesstoken,
                    id: userId,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setMessages(Array.isArray(data.data) ? data.data : []);
            } else {
                handleFetchError(data, response);
            }
        } catch (error) {
            setErrorMessage('Something went wrong while fetching messages.');
        } finally {
            setIsLoading(false);
        }
    }, [sender, receiver, accesstoken, userId, handleFetchError]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const sendMessage = async (messageContent) => {
        const currentTime = new Date().toISOString();
        const newMessage = {
            content: messageContent,
            createdAt: currentTime,
            sender: userId,
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);

        try {
            const response = await fetch(`${backendURL}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    accesstoken,
                    id: userId,
                },
                body: JSON.stringify({
                    sender: userId,
                    receiver: receiver,
                    content: messageContent,
                    createdAt: currentTime,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                handleFetchError(data, response);
            }
        } catch (error) {
            setErrorMessage('Failed to send the message.');
            setMessages((prevMessages) => prevMessages.filter(msg => msg.createdAt !== currentTime));
        }
    };

    const InputField = () => {
        const [messageText, setMessageText] = useState('');

        const handleSubmit = (e) => {
            e.preventDefault();
            if (messageText.trim()) {
                sendMessage(messageText);
                setMessageText('');
            }
        };

        return (
            <form className={styles.inputContainer} onSubmit={handleSubmit}>
                <div className={styles.inputWrapper}>
                    <div className={styles.inputField}>
                        <input
                            type='text'
                            id='messageInput'
                            className={styles.textInput}
                            placeholder='Type a message'
                            aria-label='Type a message'
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                        />
                        <div className={styles.buttonWrapper}>
                            <div className={styles.buttonContainer}>
                                <button type='submit' className={styles.sendButton}>
                                    <span className={styles.sendButtonText}>Send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return !isNaN(date.getTime())
            ? date.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' })
            : 'Invalid date';
    };

    return (
        <main className={styles.chatContainer}>
            <header className={styles.header}>
                <h3 className={styles.headerTitle}>Chat with {receiverName}</h3>
            </header>
            <div className={styles.messagesContainer}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`${styles.messageBubble} ${message.sender === userId ? styles.sent : styles.received}`}
                    >
                        <p>{message.content}</p>
                        <span className={styles.timestamp}>
                            {formatDate(message.createdAt)}
                        </span>
                    </div>
                ))}
                {isLoading && <Loader />}
            </div>
            <InputField />
            {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        </main>
    );
};

export default Message;
