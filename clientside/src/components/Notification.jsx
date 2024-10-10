import React from 'react';
import styles from '../styles/notification.module.css';

const Notification = ({ isOpen, onClose, notifications = [] }) => {
    return (
        <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <div className={styles.sidebarHeader}>
                <h2>Notifications</h2>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
            </div>
            <div className={styles.notificationList}>
                {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                        <div key={index} className={styles.notificationItem}>
                            <p>{notification.message}</p>
                        </div>
                    ))
                ) : (
                    <p>No notifications available.</p>
                )}
            </div>
        </div>
    );
};

export default Notification;
