import { Tooltip } from '@chakra-ui/react';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import styles from '../styles/formStyles.module.css';
import InputField from './InputField';
import Button from './Button';
import { backendURL } from '../api/url';

const initialState = { email: '', password: '' };

const SignInForm = () => {
    const [formData, setFormData] = useState(initialState);
    const [isDisabled, setIsDisabled] = useState(true);
    const [showEmailHelp, setShowEmailHelp] = useState(false);
    const [showPasswordHelp, setShowPasswordHelp] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = DOMPurify.sanitize(value);
        setFormData({ ...formData, [name]: sanitizedValue });

        if (name === 'email') {
            const isEmailValid = /^[0-9a-zA-Z._%+-]+@gmail\.com$/.test(sanitizedValue);
            setShowEmailHelp(!isEmailValid);
        }

        if (name === 'password') {
            const isPasswordValid = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,50}$/.test(sanitizedValue);
            setShowPasswordHelp(!isPasswordValid);
        }
    };

    const validateForm = useCallback(() => {
        const { email, password } = formData;
        return /^[0-9a-zA-Z._%+-]+@gmail\.com$/.test(email) &&
            /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,50}$/.test(password);
    }, [formData]);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${backendURL}/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('accessToken', data.token);
                localStorage.setItem('userId', data.data.id);
                alert('Login successful');
                navigate(`/${data.data.userId}/profile`);
            } else if (data.message) {
                alert(data.message);
            }
        } catch (err) {
            alert('An error occurred during login');
        }
    };

    useEffect(() => {
        setIsDisabled(!validateForm());
    }, [formData, validateForm]);

    const { email, password } = formData;

    return (
        <form className={styles.formContainer} onSubmit={onSubmit}>
            <h2 className={styles.formTitle}>Sign in</h2>
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
            <p className={styles.prompt}>
                Don't have an account? <a href="/signup">Sign up</a>
            </p>
            <div className={styles.buttonContainer}>
                <Button w='300px' type='submit' disabled={isDisabled}>
                    Sign In
                </Button>
            </div>
        </form>
    );
};

export default SignInForm;
