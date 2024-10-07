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
import FollowNotification from './FollowNotification';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [status, setStatus] = useState({
        isLoggedIn: false,
        showDropdown: false,
        name: '',
        loading: false,
        errorMessage: '',
        showModal: false,
        showSnackbar: false,
        successMessage: '',
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const token = localStorage.getItem('accesstoken');
        const storedName = localStorage.getItem('name');
        setStatus((prevState) => ({
            ...prevState,
            isLoggedIn: !!token,
            name: storedName || '',
        }));
    }, [location.pathname]);

    const handleLogout = async () => {
        const accesstoken = localStorage.getItem('accesstoken');
        const refreshtoken = localStorage.getItem('refreshtoken');
        const userId = localStorage.getItem('id');

        setStatus((prevState) => ({ ...prevState, loading: true }));
        try {
            const response = await fetch(`${backendURL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    accesstoken,
                    refreshtoken,
                    id: userId,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setStatus((prevState) => ({
                    ...prevState,
                    successMessage: data.message,
                    showSnackbar: true,
                    isLoggedIn: false,
                    name: '',
                }));

                localStorage.removeItem('accesstoken');
                localStorage.removeItem('refreshtoken');
                localStorage.removeItem('id');
                localStorage.removeItem('name');

                setTimeout(() => {
                    navigate('/signin');
                }, 1000);
            } else if (data.message && response.status !== 200) {
                navigate('/signin');
            }
        } catch {
            setStatus((prevState) => ({
                ...prevState,
                errorMessage: 'Unable to connect to the server. Please check your internet connection.',
                showModal: true,
            }));
        } finally {
            setStatus((prevState) => ({ ...prevState, loading: false }));
        }
    };

    const handleLogoClick = () => {
        navigate(status.isLoggedIn ? '/recipes' : '/signin');
    };

    const toggleDropdown = () => {
        setStatus((prevState) => ({ ...prevState, showDropdown: !prevState.showDropdown }));
    };

    const closeDropdown = () => {
        setStatus((prevState) => ({ ...prevState, showDropdown: false }));
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

                {status.isLoggedIn && (
                    <nav className={styles.navLinks}>
                        <Link to='/recipes' className={styles.navLink}>Recipes</Link>
                    </nav>
                )}

                <nav className={styles.authButtons}>
                    {!status.isLoggedIn ? (
                        (location.pathname === '/signin' || location.pathname === '/signup' || location.pathname === '/otp-verify') && (
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
                        )
                    ) : (
                        <div className={styles.profileMenu}>
                            <button className={styles.iconButton} aria-label="Notifications" onClick={toggleSidebar}>
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/d38291a9b11a8859d48e42f8f0acddefed86e9d4a9f526bdd03b4d73321cd8f7?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca"
                                    alt="Notifications"
                                    className={styles.icon}
                                />
                            </button>
                            <div className={styles.profileCircle} onClick={toggleDropdown}>
                                {status.name.charAt(0).toUpperCase()}
                            </div>
                            {status.showDropdown && (
                                <div className={styles.dropdownMenu}>
                                    <Link to='/profile/recipes' className={styles.dropdownItem} onClick={closeDropdown}>
                                        <FontAwesomeIcon icon={faCircleUser} style={{ marginRight: '10px' }} />
                                        Profile
                                    </Link>
                                    <div className={styles.logoutContainer}>
                                        <button className={styles.logoutButton} onClick={() => { handleLogout(); closeDropdown(); }}>
                                            <FontAwesomeIcon icon={faRightFromBracket} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </nav>
            </header>

            <FollowNotification isVisible={isSidebarOpen} closeSidebar={toggleSidebar} />

            {status.loading && <div className={styles.loaderContainer}><Loader /></div>}

            {status.showModal && (
                <ErrorModal
                    message={status.errorMessage}
                    onClose={() => {
                        setStatus((prevState) => ({ ...prevState, showModal: false, errorMessage: '' }));
                    }}
                />
            )}
            <Snackbar
                message={status.successMessage}
                isVisible={status.showSnackbar}
                onClose={() => setStatus((prevState) => ({ ...prevState, showSnackbar: false }))}
            />
        </>
    );
};

export default Header;
