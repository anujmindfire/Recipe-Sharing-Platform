import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/header.module.css';
import Button from './Button';

const Header = () => {
    const location = useLocation();

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <Link to="/signin" className={styles.logoLink}>
                    <img 
                        loading='lazy' 
                        src='https://cdn.builder.io/api/v1/image/assets/TEMP/816ec92c75ce46d771dff7553ea02bf564ee67407d796a5c6d3243bd7a9efc0c?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca' 
                        className={styles.logoImage} 
                        alt='Foodie logo' 
                    />
                    <h1 className={styles.logoText}>Foodie</h1>
                </Link>
            </div>
            <nav className={styles.navigation}>
                <div className={styles.authButtons}>
                    <Link to='/signup'>
                        <Button variant={location.pathname === '/signup' ? 'primary' : 'secondary'}>
                            Sign up
                        </Button>
                    </Link>
                    <Link to='/signin'>
                        <Button variant={location.pathname === '/signin' ? 'primary' : 'secondary'}>
                            Sign in
                        </Button>
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;
