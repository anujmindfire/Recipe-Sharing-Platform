import React from 'react';
import styles from '../styles/form.module.css';
import SignUpForm from '../components/SignUpForm';

const SignUpPage = () => {
    return (
        <div className={`${styles.authPage}`}>
            <main className={styles.mainContent}>
                <SignUpForm />
            </main>
        </div>
    );
};

export default SignUpPage;
