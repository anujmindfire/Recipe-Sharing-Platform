import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/header.module.css';
import Button from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { backendURL } from '../api/url';
import Snackbar from './Snackbar';
import ErrorModal from './ErrorModal';
import Loader from './Loader';

const Header = () => {
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accesstoken');
        const storedName = localStorage.getItem('name');
        setIsLoggedIn(!!token);
        setName(storedName);
    }, []);

    const handleLogout = async () => {
        const accesstoken = localStorage.getItem('accesstoken');
        const refreshtoken = localStorage.getItem('refreshtoken');
        const userId = localStorage.getItem('id');

        setLoading(true);
        try {
            const response = await fetch(`${backendURL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accesstoken': accesstoken,
                    'refreshtoken': refreshtoken,
                    'id': userId,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message);
                setShowSnackbar(true);
                localStorage.removeItem('accesstoken');
                localStorage.removeItem('refreshtoken');
                localStorage.removeItem('id');
                localStorage.removeItem('name');

                setIsLoggedIn(false);
                setTimeout(() => {
                    navigate('/signin');
                }, 1000);
            } else if (data.message) {
                setErrorMessage(data.message);
                setShowModal(true);
            }
        } catch (error) {
            setErrorMessage('Unable to connect to the server. Please check your internet connection.');
            setShowModal(true);
        }
        setLoading(false);
    };

    const handleLogoClick = () => {
        if (isLoggedIn) {
            navigate('/recipes');
        } else {
            navigate('/signin');
        }
    };

    return (
        <>
            <header className={styles.header}>
                <div className={styles.logo} onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                    <img
                        loading='lazy'
                        src='https://cdn.builder.io/api/v1/image/assets/TEMP/816ec92c75ce46d771dff7553ea02bf564ee67407d796a5c6d3243bd7a9efc0c?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca'
                        className={styles.logoImage}
                        alt='Foodie logo'
                    />
                    <h1 className={styles.logoText}>Foodies</h1>
                </div>

                {isLoggedIn && (
                    <nav className={styles.navLinks}>
                        <Link to='/recipes' className={styles.navLink}>Recipes</Link>
                    </nav>
                )}

                <nav className={styles.authButtons}>
                    {isLoggedIn ? (
                        <div className={styles.profileMenu}>
                            <div
                                className={styles.profileCircle}
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                {name.charAt(0).toUpperCase()}
                            </div>
                            {showDropdown && (
                                <div className={styles.dropdownMenu}>
                                    <Link to='/profile' className={styles.dropdownItem}>
                                        <FontAwesomeIcon icon={faCircleUser} style={{ marginRight: '10px' }} />
                                        Profile
                                    </Link>
                                    <div className={styles.logoutContainer}>
                                        <button className={styles.logoutButton} onClick={handleLogout}>
                                            <FontAwesomeIcon icon={faRightFromBracket} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </nav>
            </header>

            {loading && <div className={styles.loaderContainer}><Loader /></div>}

            {showModal && (
                <ErrorModal
                    message={errorMessage}
                    onClose={() => {
                        setShowModal(false);
                        setErrorMessage('');
                    }}
                />
            )}
            <Snackbar
                message={successMessage}
                isVisible={showSnackbar}
                onClose={() => setShowSnackbar(false)}
            />
        </>
    );
};

export default Header;
