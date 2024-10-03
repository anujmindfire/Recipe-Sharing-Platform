import React, { useEffect } from 'react';
import styles from '../styles/snackbar.module.css';

const Snackbar = ({ message, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <div className={`${styles.snackbar} ${isVisible ? styles.show : ''}`}>
            {message}
        </div>
    );
};

export default Snackbar;
