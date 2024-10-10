import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/otp.module.css';
import Loader from '../components/Loader';
import ErrorModal from '../components/ErrorModal';
import Snackbar from '../components/Snackbar';
import { backendURL } from '../api/url';

const OTPVerification = () => {
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const [status, setStatus] = useState({
        loading: false,
        showModal: false,
        showSnackbar: false,
        messages: { success: '', error: '' },
        resendTimer: 60,
        isResendDisabled: true,
    });

    const navigate = useNavigate();
    const otpRefs = useRef(otp.map(() => React.createRef()));

    useEffect(() => {
        if (!localStorage.getItem('email') && !localStorage.getItem('txnId')) {
            navigate('/signup');
        }
    }, [navigate]);

    useEffect(() => {
        const handleUnload = () => localStorage.setItem('isLeavingOTPPage', 1);
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);

    useEffect(() => {
        if (Number(localStorage.getItem('isLeavingOTPPage')) === 1) {
            localStorage.setItem('isLeavingOTPPage', 2);
            navigate('/signup');
        } else if (Number(localStorage.getItem('isLeavingOTPPage')) === 2 ) {
            localStorage.removeItem('isLeavingOTPPage');
        }
    }, [navigate]);

    useEffect(() => {
        if (status.resendTimer > 0 && status.isResendDisabled) {
            const interval = setInterval(() => setStatus(prev => ({ ...prev, resendTimer: prev.resendTimer - 1 })), 1000);
            return () => clearInterval(interval);
        }
        if (status.resendTimer === 0) {
            setStatus(prev => ({ ...prev, isResendDisabled: false }));
        }
    }, [status.resendTimer, status.isResendDisabled]);

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < otp.length - 1) otpRefs.current[index + 1].current.focus();
        if (!value && index > 0) otpRefs.current[index - 1].current.focus();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            otpRefs.current[index - 1].current.focus();
        }
    };

    const handleInputChange = (e, index) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            handleOtpChange(value, index);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setStatus(prev => ({ ...prev, loading: true }));

        const otpValue = otp.join('');
        const transactionId = localStorage.getItem('txnId');

        if (otpValue.length !== 6) {
            setStatus(prev => ({ ...prev, messages: { ...prev.messages, error: 'Please enter all 6 digits.' }, showModal: true, loading: false }));
            return;
        }

        try {
            const response = await fetch(`${backendURL}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp: otpValue, txnId: transactionId }),
            });
            const data = await response.json();

            if (response.ok) {
                setStatus(prev => ({ ...prev, messages: { ...prev.messages, success: data.message }, showSnackbar: true }));
                setTimeout(() => {
                    localStorage.removeItem('isVerified');
                    localStorage.removeItem('txnId');
                    navigate('/signin');
                }, 1000);
            } else {
                setStatus(prev => ({ ...prev, messages: { ...prev.messages, error: data.message }, showModal: true }));
            }
        } catch {
            setStatus(prev => ({ ...prev, messages: { ...prev.messages, error: 'Unable to connect to the server. Please check your internet connection.' }, showModal: true }));
        }
        setStatus(prev => ({ ...prev, loading: false }));
    };

    const handleResendOtp = async () => {
        setStatus(prev => ({ ...prev, loading: true, isResendDisabled: true, resendTimer: 60 }));

        const transactionId = localStorage.getItem('txnId');

        try {
            const response = await fetch(`${backendURL}/resend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ txnId: transactionId }),
            });
            const data = await response.json();

            if (response.ok) {
                setStatus(prev => ({ ...prev, messages: { ...prev.messages, success: data.message }, showSnackbar: true }));
            } else {
                setStatus(prev => ({ ...prev, messages: { ...prev.messages, error: data.message }, showModal: true }));
                setTimeout(() => {
                    navigate('/signup');
                }, 1000);
            }
        } catch {
            setStatus(prev => ({ ...prev, messages: { ...prev.messages, error: 'Unable to connect to the server. Please check your internet connection.' }, showModal: true }));
        }
        setStatus(prev => ({ ...prev, loading: false }));
    };

    return (
        <main className={styles.main}>
            <form className={styles.verifySection} onSubmit={handleVerifyOtp}>
                <h1 className={styles.title}>Verify Your Account</h1>
                <p className={styles.subtitle}>Enter the 6-digit code sent to your email.</p>
                <div className={styles.codeInputContainer}>
                    <div className={styles.codeInput}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type='text'
                                maxLength='1'
                                value={digit}
                                onChange={(e) => handleInputChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className={styles.codeDigit}
                                aria-label={`Digit ${index + 1}`}
                                ref={otpRefs.current[index]}
                            />
                        ))}
                    </div>
                </div>
                <div className={styles.buttonContainer}>
                    <div className={styles.buttonWrapper}>
                        <button
                            className={styles.resendButton}
                            type='button'
                            onClick={handleResendOtp}
                            disabled={status.isResendDisabled || status.loading}
                        >
                            {status.isResendDisabled ? `Resend OTP in ${status.resendTimer}s` : 'Resend OTP'}
                        </button>
                        <button
                            className={styles.verifyButton}
                            type='submit'
                            disabled={status.loading || otp.some(digit => digit === '')}
                        >
                            Verify
                        </button>
                    </div>
                </div>

                {status.loading && <Loader />}
                
                {status.showModal && (
                    <ErrorModal
                        message={status.messages.error}
                        onClose={() => setStatus(prev => ({ ...prev, showModal: false, messages: { ...prev.messages, error: '' } }))}
                    />
                )}

                <Snackbar
                    message={status.messages.success}
                    isVisible={status.showSnackbar}
                    onClose={() => setStatus(prev => ({ ...prev, showSnackbar: false }))}
                />
            </form>
        </main>
    );
};

export default OTPVerification;
