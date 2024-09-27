import React from 'react';
import styles from '../styles/inputField.module.css';

const InputField = React.forwardRef(({ label, name, type = 'text', value, onChange, onFocus, onBlur, className }, ref) => {
    return (
        <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor={name}>{label}</label>
            <input
                className={`${styles.input} ${className}`}
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                ref={ref}
            />
        </div>
    );
});

export default InputField;
