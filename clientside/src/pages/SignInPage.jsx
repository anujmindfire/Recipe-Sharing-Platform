import React from 'react';
import styles from '../styles/formPage.module.css';
import Header from '../components/Header';
import SignInForm from '../components/SignInForm';

const SignInPage = () => {
    return (
        <div className={`${styles.authPage}`}>
            <Header />
            <main className={styles.mainContent}>
                <SignInForm />
            </main>
        </div>
    );
};

export default SignInPage;
