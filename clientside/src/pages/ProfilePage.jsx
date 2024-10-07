import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import styles from '../styles/profilePage.module.css';
import withAuthentication from '../utils/withAuthenicate';

const ProfilePage = () => {
    return (
        <div className={styles.profilePage}>
            <div className={styles.appContainer}>
                <main className={styles.mainSection}>
                    <Sidebar />
                    <div className={styles.divider} />
                    <section className={styles.mainContent}>
                        <Outlet />
                    </section>
                </main>
            </div>
        </div>
    );
};

export default withAuthentication(ProfilePage);
