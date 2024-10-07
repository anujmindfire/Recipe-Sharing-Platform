import { Tooltip } from '@chakra-ui/react';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import styles from '../styles/form.module.css';
import InputField from './InputField';
import Button from './Button';
import Loader from './Loader';
import Snackbar from './Snackbar';
import ErrorModal from './ErrorModal';
import { backendURL } from '../api/url';

const initialState = {
    email: '',
    password: '',
    isDisabled: true,
    showEmailHelp: false,
    showPasswordHelp: false,
    loading: false,
    errorMessage: '',
    showModal: false,
    showSnackbar: false,
    successMessage: '',
};

const SignInForm = () => {
    const [status, setStatus] = useState(initialState);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = DOMPurify.sanitize(value);
        
        setStatus((prev) => ({
            ...prev,
            [name]: sanitizedValue,
            showEmailHelp: name === 'email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedValue) : prev.showEmailHelp,
            showPasswordHelp: name === 'password' ? !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,50}$/.test(sanitizedValue) : prev.showPasswordHelp,
            isDisabled: !validateForm({ ...prev, [name]: sanitizedValue }), // Validate on change
        }));
    };

    const validateForm = useCallback((currentStatus) => {
        const { email, password } = currentStatus;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,50}$/.test(password);
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        setStatus((prev) => ({ ...prev, loading: true }));

        try {
            const response = await fetch(`${backendURL}/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: status.email, password: status.password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('accesstoken', data.accessToken);
                localStorage.setItem('refreshtoken', data.refreshToken);
                localStorage.setItem('id', data.data.userId);
                localStorage.setItem('name', data.data.name);

                setStatus((prev) => ({
                    ...prev,
                    successMessage: data.message,
                    showSnackbar: true,
                }));

                setTimeout(() => {
                    navigate('/recipes');
                }, 1000);
            } else if (data.message) {
                setStatus((prev) => ({
                    ...prev,
                    errorMessage: data.message,
                    showModal: true,
                }));
            }
        } catch (error) {
            setStatus((prev) => ({
                ...prev,
                errorMessage: 'Unable to connect to the server. Please check your internet connection.',
                showModal: true,
            }));
        } finally {
            setStatus((prev) => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        const accessToken = localStorage.getItem('accesstoken');
        const refreshToken = localStorage.getItem('refreshtoken');
        if (accessToken && refreshToken) {
            navigate('/recipes');
        }
    }, [navigate]);

    const { email, password, loading, showEmailHelp, showPasswordHelp, showModal, errorMessage, showSnackbar, successMessage, isDisabled } = status;

    return (
        <>
            <form className={styles.formContainer} onSubmit={onSubmit}>
                <h2 className={styles.formTitle}>Sign in</h2>
                <Tooltip hasArrow label={showEmailHelp ? 'Please Enter Valid Email' : ''} isOpen={showEmailHelp} placement='top'>
                    <InputField
                        className={styles.inputField}
                        label='Email'
                        name='email'
                        type='email'
                        value={email}
                        onChange={handleChange}
                        onBlur={() => setStatus((prev) => ({ ...prev, showEmailHelp: false }))}
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
                        onBlur={() => setStatus((prev) => ({ ...prev, showPasswordHelp: false }))}
                    />
                </Tooltip>
                <p className={styles.prompt}>
                    Don't have an account? <a href='/signup'>Sign up</a>
                </p>
                <p className={styles.prompt}>
                    <a href='/forgot-password'>Forgot Password?</a>
                </p>
                <div className={styles.buttonContainer}>
                    <Button w='300px' type='submit' disabled={isDisabled || loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </div>

                {loading && <Loader />}
            </form>

            {showModal && (
                <ErrorModal
                    message={errorMessage}
                    onClose={() => setStatus((prev) => ({ ...prev, showModal: false, errorMessage: '' }))}
                />
            )}

            <Snackbar
                message={successMessage}
                isVisible={showSnackbar}
                onClose={() => setStatus((prev) => ({ ...prev, showSnackbar: false }))}
            />
        </>
    );
};

export default SignInForm;
