import React from 'react';
import styles from '../styles/form.module.css';
import SignInForm from '../components/SignInForm';

const SignInPage = () => {
    return (
        <div className={`${styles.authPage}`}>
            <main className={styles.mainContent}>
                <SignInForm />
            </main>
        </div>
    );
};

export default SignInPage;
