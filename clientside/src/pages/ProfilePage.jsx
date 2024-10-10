import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import styles from '../styles/profilePage.module.css';

const ProfilePage = () => {
    return (
        <div className={styles.profilePage}>
            <div className={styles.appContainer}>
                <main className={styles.mainSection}>
                    <Sidebar />
                    <section className={styles.mainContent}>
                        <Outlet />
                    </section>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
