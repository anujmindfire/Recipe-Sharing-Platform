import React from 'react';
import styles from '../styles/loader.module.css';

const Loader = () => {
    return (
        <div className={styles.loaderContainer}>
            <img
                src='https://x.yummlystatic.com/web/spinner-light-bg.gif'
                alt='Loading...'
                className={styles.spinner}
            />
        </div>
    );
};

export default Loader;
