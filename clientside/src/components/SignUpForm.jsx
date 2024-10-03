import { Tooltip } from '@chakra-ui/react';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import styles from '../styles/formStyles.module.css';
import InputField from './InputField';
import Loader from './Loader';
import Button from './Button';
import ErrorModal from './ErrorModal';
import Snackbar from './Snackbar';
import { backendURL } from '../api/url';

const initialState = { name: '', email: '', password: '', confirmPassword: '' };

const SignUpForm = () => {
    const [formData, setFormData] = useState(initialState);
    const [isDisabled, setIsDisabled] = useState(true);
    const [nameError, setNameError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [showPasswordHelp, setShowPasswordHelp] = useState(false);
    const [showEmailHelp, setShowEmailHelp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
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
            const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,50}$/.test(sanitizedValue);
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
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,50}$/.test(password) &&
            password === confirmPassword;
    }, [formData]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setIsDisabled(true);

        try {
            const response = await fetch(`${backendURL}/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccessMessage(data.message);
                setShowSnackbar(true);
                setTimeout(() => {
                    navigate('/signin');
                }, 1000);
            } else if (data.message) {
                setErrorMessage(data.message);
                setShowModal(true);
            }
        } catch (error) {
            setErrorMessage('Unable to connect to the server. Please check your internet connection.');
            setShowModal(true);
        }
        setLoading(false);
        setIsDisabled(false);
    };

    useEffect(() => {
        const accessToken = localStorage.getItem('accesstoken');
        const refreshToken = localStorage.getItem('refreshtoken');
        if (accessToken && refreshToken) {
            alert('You are already logged in. Please log out to access the signup page.');
            navigate('/recipes');
        }
    }, [navigate]);

    useEffect(() => {
        setIsDisabled(!validateForm());
    }, [formData, validateForm]);

    const { name, email, password, confirmPassword } = formData;

    return (
        <>
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
                    Already have an account? <a href='/signin'>Sign in</a>
                </p>

                <div className={styles.buttonContainer}>
                    <Button w='300px' type='submit' disabled={isDisabled || loading}>
                        Sign up
                    </Button>
                </div>

                {loading && (
                    <div className={styles.loaderContainer}>
                        <Loader />
                    </div>
                )}
            </form>

            {showModal && (
                <ErrorModal
                    message={errorMessage}
                    onClose={() => {
                        setShowModal(false);
                        setErrorMessage('');
                    }}
                />
            )}

            <Snackbar
                message={successMessage}
                isVisible={showSnackbar}
                onClose={() => setShowSnackbar(false)}
            />
        </>
    );
};

export default SignUpForm;
