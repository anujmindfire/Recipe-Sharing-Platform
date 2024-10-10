import React from 'react';
import styles from '../styles/inputField.module.css';

const InputField = React.forwardRef(({ label, name, type = 'text', value, onChange, onFocus, onBlur, className, disabled = false, options = [] }, ref) => {
    return (
        <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor={name}>{label}</label>
            {type === 'textarea' ? (
                <textarea
                    className={`${styles.input} ${styles.textarea} ${className}`}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    ref={ref}
                    disabled={disabled}
                />
            ) : type === 'select' ? (
                <select
                    className={`${styles.input} ${className}`}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    ref={ref}
                    disabled={disabled}
                >
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
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
                    disabled={disabled}
                />
            )}
        </div>
    );
});

export default InputField;
