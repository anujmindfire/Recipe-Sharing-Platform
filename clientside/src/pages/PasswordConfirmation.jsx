import { Tooltip } from '@chakra-ui/react';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import InputField from '../components/InputField';
import Loader from '../components/Loader';
import Snackbar from '../components/Snackbar';
import ErrorModal from '../components/ErrorModal';
import Button from '../components/Button';
import styles from '../styles/form.module.css';
import { backendURL } from '../api/url';

const PasswordConfirmation = () => {
    const { txnId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [status, setStatus] = useState({
        loading: false,
        showModal: false,
        showSnackbar: false,
        messages: { success: '', error: '' }
    });
    const [isDisabled, setIsDisabled] = useState(true);
    const [showPasswordHelp, setShowPasswordHelp] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const isValidPassword = (password) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,50}$/.test(password);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = DOMPurify.sanitize(value);
        setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));

        if (name === 'password') {
            setShowPasswordHelp(!isValidPassword(sanitizedValue));
        }

        if (name === 'confirmPassword') {
            setConfirmPasswordError(sanitizedValue !== formData.password ? 'Passwords do not match.' : '');
        }
    };

    const validateForm = useCallback(() => {
        const { password, confirmPassword } = formData;
        return isValidPassword(password) && password === confirmPassword;
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus((prev) => ({ ...prev, loading: true }));

        try {
            const response = await fetch(`${backendURL}/password/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, txnId })
            });

            const data = await response.json();
            if (response.ok) {
                setStatus({ 
                    loading: false, 
                    showSnackbar: true, 
                    messages: { success: data.message, error: '' } 
                });
                setTimeout(() => navigate('/signin'), 1000);
            } else {
                setStatus({ 
                    loading: false, 
                    showModal: true, 
                    messages: { success: '', error: data.message } 
                });
                if (data.message === 'Link has expired') {
                    setTimeout(() => navigate('/forgot-password'), 1000);
                }
            }
        } catch (error) {
            setStatus({ 
                loading: false, 
                showModal: true, 
                messages: { success: '', error: error.message } 
            });
        }
    };

    useEffect(() => {
        setIsDisabled(!validateForm());
    }, [formData, validateForm]);

    useEffect(() => {
        if (!localStorage.getItem('email') && !localStorage.getItem('txnId')) {
            navigate('/forgot-password');
        }
    }, [navigate]);

    useEffect(() => {
        const handleUnload = () => localStorage.setItem('isLeavingPasswordPage', 1);
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);

    useEffect(() => {
        let matchTxnId = txnId === localStorage.getItem('txnId');
        if (Number(localStorage.getItem('isLeavingPasswordPage')) === 1 && matchTxnId) {
            localStorage.setItem('isLeavingPasswordPage', 2);
            navigate('/forgot-password');
        } else if (Number(localStorage.getItem('isLeavingPasswordPage')) === 2 && matchTxnId) {
            localStorage.removeItem('isLeavingPasswordPage');
        }
    }, [navigate, txnId]);

    return (
        <div className={styles.authPage}>
            <main className={styles.mainContent}>
                <form className={styles.formContainer} onSubmit={handleSubmit}>
                    <h2 className={styles.formTitle}>Reset Password</h2>
                    
                    <Tooltip
                        hasArrow
                        label={showPasswordHelp ? 'Password must be 8-50 characters long consisting of at least one number, uppercase letter, lowercase letter, and special character' : ''}
                        isOpen={showPasswordHelp}
                        placement="top"
                    >
                        <InputField
                            className={styles.inputField}
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={() => setShowPasswordHelp(false)}
                        />
                    </Tooltip>

                    <Tooltip
                        hasArrow
                        label={confirmPasswordError}
                        isOpen={!!confirmPasswordError}
                        placement="top"
                    >
                        <InputField
                            className={styles.inputField}
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={() => setConfirmPasswordError('')}
                        />
                    </Tooltip>

                    <div className={styles.buttonContainer}>
                        <Button w="300px" type="submit" disabled={isDisabled || status.loading}>
                            Reset Password
                        </Button>
                    </div>

                    {status.loading && <Loader />}
                </form>

                {status.showModal && (
                    <ErrorModal
                        message={status.messages.error}
                        onClose={() => setStatus((prev) => ({ ...prev, showModal: false }))}
                    />
                )}

                <Snackbar
                    message={status.messages.success}
                    isVisible={status.showSnackbar}
                    onClose={() => setStatus((prev) => ({ ...prev, showSnackbar: false }))}
                />
            </main>

            <div className={styles.expirationNote}>
                <p>
                    <strong>Note:</strong> Please be careful when reloading the page, as the reset link may expire. If this happens, you will need to request a new password reset.
                </p>
            </div>
        </div>
    );
};

export default PasswordConfirmation;
