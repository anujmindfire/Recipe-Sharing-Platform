import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../styles/followNotification.module.css';

const FollowNotification = ({ notifications = [] }) => {
    const location = useLocation();

    const isShareMessagePage = location.pathname === '/profile/recipes';

    if (!isShareMessagePage) {
        return null;
    }

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
