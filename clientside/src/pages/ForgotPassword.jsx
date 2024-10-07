import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Tooltip } from '@chakra-ui/react';
import styles from '../styles/form.module.css';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Snackbar from '../components/Snackbar';
import ErrorModal from '../components/ErrorModal';
import { backendURL } from '../api/url';

const ForgotPasswordPage = () => {
    const [formData, setFormData] = useState({ email: '' });
    const [status, setStatus] = useState({
        loading: false,
        showModal: false,
        showSnackbar: false,
        errorMessage: '',
        successMessage: ''
    });
    const [showEmailHelp, setShowEmailHelp] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = DOMPurify.sanitize(value);

        setFormData({ [name]: sanitizedValue });
        setShowEmailHelp(!validateEmail(sanitizedValue));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(prev => ({ ...prev, loading: true }));

        try {
            const response = await fetch(`${backendURL}/password/sendEmail`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                setStatus(prev => ({
                    ...prev,
                    loading: false,
                    showSnackbar: true,
                    showModal: false,
                    successMessage: data.message,
                    errorMessage: ''
                }));
                localStorage.setItem('txnId', data.data.txnId);
                localStorage.setItem('email', true);
                setTimeout(() => navigate('/signin'), 1000);
            } else {
                setStatus(prev => ({
                    ...prev,
                    loading: false,
                    showModal: true,
                    showSnackbar: false,
                    successMessage: '',
                    errorMessage: data.message
                }));
            }
        } catch {
            setStatus(prev => ({
                ...prev,
                loading: false,
                showModal: true,
                showSnackbar: false,
                successMessage: '',
                errorMessage: 'Unable to connect to the server. Please check your internet connection.'
            }));
        }
    };

    useEffect(() => {
        setShowEmailHelp(!validateEmail(formData.email));
        localStorage.removeItem('email');
        localStorage.removeItem('txnId');
    }, [formData.email]);

    const isFormValid = useCallback(() => validateEmail(formData.email), [formData.email]);

    return (
        <div className={styles.authPage}>
            <main className={styles.mainContent}>
                <form className={styles.formContainer} onSubmit={handleSubmit}>
                    <h2 className={styles.formTitle}>Forgot Password</h2>
                    <Tooltip
                        hasArrow
                        label={showEmailHelp ? 'Please enter a valid email' : ''}
                        isOpen={showEmailHelp}
                        placement='top'
                    >
                        <InputField
                            className={styles.inputField}
                            label='Email'
                            name='email'
                            type='email'
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={() => setShowEmailHelp(false)}
                        />
                    </Tooltip>
                    <p className={styles.prompt}>
                        Remembered your password? <a href='/signin'>Sign in</a>
                    </p>
                    <div className={styles.buttonContainer}>
                        <Button w='300px' type='submit' disabled={status.loading || !isFormValid()}>
                            {status.loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </div>

                    {status.loading && <Loader />}
                </form>

                {status.showModal && (
                    <ErrorModal
                        message={status.errorMessage}
                        onClose={() => {
                            setStatus(prev => ({ ...prev, showModal: false, errorMessage: '' }));
                        }}
                    />
                )}

                <Snackbar
                    message={status.successMessage}
                    isVisible={status.showSnackbar}
                    onClose={() => setStatus(prev => ({ ...prev, showSnackbar: false }))}
                />
            </main>
        </div>
    );
};

export default ForgotPasswordPage;
