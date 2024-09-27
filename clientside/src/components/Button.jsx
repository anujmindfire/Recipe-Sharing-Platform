import React from 'react';
import styles from '../styles/button.module.css';

const Button = ({ children, variant = 'primary', onClick, disabled }) => {
    return (
        <button
            className={`${styles.button} ${styles[variant]}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
