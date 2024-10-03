import React from 'react';
import styles from '../styles/errorModal.module.css';
import Button from './Button';

const ErrorModal = ({ message, onClose }) => {
    return (
        <div className={styles.errorModal}>
            <div className={styles.errorContent}>
                <h1>Whoops!</h1>
                <p>{message}</p>
                <Button onClick={onClose}>Close</Button>
            </div>
        </div>
    );
};

export default ErrorModal;
