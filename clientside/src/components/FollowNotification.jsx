import React from 'react';
import styles from '../styles/followNotification.module.css';

const FollowNotification = ({ notifications = [] }) => {
    return (
        <div className={styles.notificationContainer}>
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
                <p>No new notifications</p>
            ) : (
                notifications.map((notification, index) => (
                    <div key={index} className={styles.notification}>
                        <p>{notification}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default FollowNotification;
