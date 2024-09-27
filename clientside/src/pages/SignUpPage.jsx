import React from 'react';
import styles from '../styles/formPage.module.css';
import Header from '../components/Header';
import SignUpForm from '../components/SignUpForm';

const SignUpPage = () => {
    return (
        <div className={`${styles.authPage}`}>
            <Header />
            <main className={styles.mainContent}>
                <SignUpForm />
            </main>
        </div>
    );
};

export default SignUpPage;
