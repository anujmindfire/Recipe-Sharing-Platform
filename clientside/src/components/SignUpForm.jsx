import { Tooltip } from '@chakra-ui/react';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import styles from '../styles/formStyles.module.css';
import InputField from './InputField';
import Button from './Button';
import { backendURL } from '../api/url';

const initialState = { name: '', email: '', password: '', confirmPassword: '' };

const SignUpForm = () => {
    const [formData, setFormData] = useState(initialState);
    const [isDisabled, setIsDisabled] = useState(true);
    const [nameError, setNameError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [showPasswordHelp, setShowPasswordHelp] = useState(false);
    const [showEmailHelp, setShowEmailHelp] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = DOMPurify.sanitize(value);
        setFormData({ ...formData, [name]: sanitizedValue });

        if (name === 'name') {
            const isValidName = /^[A-Za-z\s]+$/.test(sanitizedValue);
            if (sanitizedValue === '') {
                setNameError('');
            } else if (!isValidName) {
                setNameError('Name can only contain letters and spaces.');
            } else if (sanitizedValue.length < 2 || sanitizedValue.length > 50) {
                setNameError('Name should be greater than 2 and less than 50 characters.');
            } else {
                setNameError('');
            }
        }

        if (name === 'email') {
            const isEmailValid = /^[0-9a-zA-Z._%+-]+@gmail\.com$/.test(sanitizedValue);
            setShowEmailHelp(!isEmailValid);
        }

        if (name === 'password') {
            const isPasswordValid = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,50}$/.test(sanitizedValue);
            setShowPasswordHelp(!isPasswordValid);
        }

        if (name === 'confirmPassword') {
            setConfirmPasswordError(sanitizedValue !== formData.password ? 'Passwords do not match.' : '');
        }
    };

    const validateForm = useCallback(() => {
        const { name, email, password, confirmPassword } = formData;
        return name.length >= 2 && name.length <= 50 && /^[A-Za-z\s]+$/.test(name) &&
               /^[0-9a-zA-Z._%+-]+@gmail\.com$/.test(email) &&
               /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,50}$/.test(password) &&
               password === confirmPassword;
    }, [formData]);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${backendURL}/user/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Signup successful. Please Sign in.');
                navigate('/signin');
            } else if (data.message) {
                alert(data.message);
            }
        } catch {
            alert('An error occurred during signup');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');
        if (token) {
            alert('You are already a loggedIn user, if you are trying to access the register page, please log out first.');
            navigate(`/${userId}/profile`);
        }
    }, [navigate]);

    useEffect(() => {
        setIsDisabled(!validateForm());
    }, [formData, validateForm]);

    const { name, email, password, confirmPassword } = formData;

    return (
        <form className={styles.formContainer} onSubmit={onSubmit}>
            <h2 className={styles.formTitle}>Sign Up</h2>
            <Tooltip hasArrow label={nameError} isOpen={!!nameError} placement='top'>
                <InputField
                    className={styles.inputField}
                    label='Name'
                    name='name'
                    type='text'
                    value={name}
                    onChange={handleChange}
                    onBlur={() => setNameError('')}
                />
            </Tooltip>
            <Tooltip hasArrow label={showEmailHelp ? 'Only gmail.com mail is accepted' : ''} isOpen={showEmailHelp} placement='top'>
                <InputField
                    className={styles.inputField}
                    label='Email'
                    name='email'
                    type='email'
                    value={email}
                    onChange={handleChange}
                    onBlur={() => setShowEmailHelp(false)}
                />
            </Tooltip>
            <Tooltip hasArrow label={showPasswordHelp ? 'Password must be 8-50 characters long consisting of at least one number, uppercase letter, lowercase letter, and special character' : ''} isOpen={showPasswordHelp} placement='top'>
                <InputField
                    className={styles.inputField}
                    label='Password'
                    name='password'
                    type='password'
                    value={password}
                    onChange={handleChange}
                    onBlur={() => setShowPasswordHelp(false)}
                />
            </Tooltip>
            <Tooltip hasArrow label={confirmPasswordError} isOpen={!!confirmPasswordError} placement='top'>
                <InputField
                    className={styles.inputField}
                    label='Confirm Password'
                    name='confirmPassword'
                    type='password'
                    value={confirmPassword}
                    onChange={handleChange}
                    onBlur={() => setConfirmPasswordError('')}
                />
            </Tooltip>
            <p className={styles.prompt}>
                Already have an account? <a href="/signin">Sign in</a>
            </p>
            
            <div className={styles.buttonContainer}>
                <Button w='300px' type='submit' disabled={isDisabled}>
                    Sign Up
                </Button>
            </div>
            
        </form>
    );
};

export default SignUpForm;
