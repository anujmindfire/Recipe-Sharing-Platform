import { Tooltip } from '@chakra-ui/react';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import styles from '../styles/form.module.css';
import InputField from './InputField';
import Loader from './Loader';
import Button from './Button';
import ErrorModal from './ErrorModal';
import { backendURL } from '../api/url';

const initialState = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    errors: {
        name: '',
        confirmPassword: '',
    },
    showHelp: {
        email: false,
        password: false,
    },
    loading: false,
    errorMessage: '',
    showModal: false,
};

const SignUpForm = () => {
    const [formData, setFormData] = useState(initialState);
    const [isDisabled, setIsDisabled] = useState(true);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = DOMPurify.sanitize(value);

        setFormData((prev) => ({
            ...prev,
            [name]: sanitizedValue,
            errors: {
                ...prev.errors,
                [name]: validateField(name, sanitizedValue),
            },
        }));

        if (name === 'email') {
            setFormData((prev) => ({
                ...prev,
                showHelp: {
                    ...prev.showHelp,
                    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedValue),
                },
            }));
        }

        if (name === 'password') {
            setFormData((prev) => ({
                ...prev,
                showHelp: {
                    ...prev.showHelp,
                    password: !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,50}$/.test(sanitizedValue),
                },
            }));
        }

        if (name === 'confirmPassword') {
            setFormData((prev) => ({
                ...prev,
                errors: {
                    ...prev.errors,
                    confirmPassword: sanitizedValue !== formData.password ? 'Passwords do not match.' : '',
                },
            }));
        }
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (!/^[A-Za-z\s]+$/.test(value)) return 'Name can only contain letters and spaces.';
                if (value.length < 2 || value.length > 50) return 'Name should be greater than 2 and less than 50 characters.';
                return '';
            case 'confirmPassword':
                return value !== formData.password ? 'Passwords do not match.' : '';
            default:
                return '';
        }
    };

    const validateForm = useCallback(() => {
        const { name, email, password, confirmPassword } = formData;
        return (
            name.length >= 2 &&
            name.length <= 50 &&
            /^[A-Za-z\s]+$/.test(name) &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,50}$/.test(password) &&
            password === confirmPassword
        );
    }, [formData]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setFormData((prev) => ({ ...prev, loading: true }));
        setIsDisabled(true);

        try {
            const response = await fetch(`${backendURL}/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('txnId', data.data.txnId);
                localStorage.setItem('email', true);
                setTimeout(() => {
                    navigate('/otp-verify');
                }, 1000);
            } else if (data.message) {
                setFormData((prev) => ({ ...prev, errorMessage: data.message, showModal: true }));
            }
        } catch {
            setFormData((prev) => ({ ...prev, errorMessage: 'Unable to connect to the server. Please check your internet connection.', showModal: true }));
        } finally {
            setFormData((prev) => ({ ...prev, loading: false }));
            setIsDisabled(false);
        }
    };

    useEffect(() => {
        const accessToken = localStorage.getItem('accesstoken');
        const refreshToken = localStorage.getItem('refreshtoken');
        localStorage.removeItem('email');
        localStorage.removeItem('txnId');
        if (accessToken && refreshToken) {
            navigate('/recipes');
        }
    }, [navigate]);

    useEffect(() => {
        setIsDisabled(!validateForm());
    }, [formData, validateForm]);

    const { name, email, password, confirmPassword, errors, showHelp, loading, showModal, errorMessage } = formData;

    return (
        <>
            <form className={styles.formContainer} onSubmit={onSubmit}>
                <h2 className={styles.formTitle}>Sign Up</h2>
                <Tooltip hasArrow label={errors.name} isOpen={!!errors.name} placement='top'>
                    <InputField
                        className={styles.inputField}
                        label='Name'
                        name='name'
                        type='text'
                        value={name}
                        onChange={handleChange}
                        onBlur={() => setFormData((prev) => ({ ...prev, errors: { ...prev.errors, name: validateField('name', name) } }))}
                    />
                </Tooltip>
                <Tooltip hasArrow label={showHelp.email ? 'Please Enter Valid Email' : ''} isOpen={showHelp.email} placement='top'>
                    <InputField
                        className={styles.inputField}
                        label='Email'
                        name='email'
                        type='email'
                        value={email}
                        onChange={handleChange}
                        onBlur={() => setFormData((prev) => ({ ...prev, showHelp: { ...prev.showHelp, email: false } }))}
                    />
                </Tooltip>
                <Tooltip hasArrow label={showHelp.password ? 'Password must be 8-50 characters long consisting of at least one number, uppercase letter, lowercase letter, and special character' : ''} isOpen={showHelp.password} placement='top'>
                    <InputField
                        className={styles.inputField}
                        label='Password'
                        name='password'
                        type='password'
                        value={password}
                        onChange={handleChange}
                        onBlur={() => setFormData((prev) => ({ ...prev, showHelp: { ...prev.showHelp, password: false } }))}
                    />
                </Tooltip>
                <Tooltip hasArrow label={errors.confirmPassword} isOpen={!!errors.confirmPassword} placement='top'>
                    <InputField
                        className={styles.inputField}
                        label='Confirm Password'
                        name='confirmPassword'
                        type='password'
                        value={confirmPassword}
                        onChange={handleChange}
                        onBlur={() => setFormData((prev) => ({ ...prev, errors: { ...prev.errors, confirmPassword: validateField('confirmPassword', confirmPassword) } }))}
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

                {loading && <Loader />}
            </form>

            {showModal && (
                <ErrorModal
                    message={errorMessage}
                    onClose={() => {
                        setFormData((prev) => ({ ...prev, showModal: false, errorMessage: '' }));
                    }}
                />
            )}
        </>
    );
};

export default SignUpForm;
