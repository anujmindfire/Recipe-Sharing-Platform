import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/sidebar.module.css';

const Sidebar = () => {
    const userId = localStorage.getItem('userId');
    const location = useLocation();

    const menuItems = [
        { 
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/2beb0567234f2366a8a65cd6189ff27674bdd8caffff2735324e18eafa9d3472?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca', 
            label: 'My Recipes', 
            path: `/profile/recipes` 
        },
        { 
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/cad8b2dda37d4606c12f22d8ee453f6eb3819343a9114a3d6f897e017e3fa7b8?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca', 
            label: 'My Favorites', 
            path: `/profile/favourites` 
        },
        { 
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/97548eaf18c713094b7cfc5d4136dcacee8b769f39ec2d9132a7eb865f56e738?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca', 
            label: 'Following', 
            path: `/profile/following` 
        },
        { 
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/12ee3116cbb1bf8d6748ce3226b23c6b0c7c52e9b28bbcb6c693fdcd498c5b17?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca', 
            label: 'Followers', 
            path: `/profile/follower` 
        },
        { 
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/aa00526d61739d74ce9f636d5bed7d5ed52880addcea0180cb5b313fa3f52292?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca', 
            label: 'Edit Profile', 
            path: `/profile/${userId}` 
        },
        { 
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/41d8c039d9f44fce79557d896a66e29271cf60215b3b7146f0a65eb57baac2bf?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca',
            label: 'Users', 
            path: `/profile/list`
        },
        { 
            icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/cd41223319358e5e2f122fa14a9ca8f55ab3b3d8eece9f8078464a3b81af6637?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca',
            label: 'Share Recipes', 
            path: `/profile/share/message`
        }
    ];

    const storedName = localStorage.getItem('name');

    return (
        <aside className={styles.sidebar}>
            <div className={styles.profileMenu}>
                <div className={styles.profileCircle}>
                    {storedName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.userInfo}>
                    <p className={styles.username}>{storedName}</p>
                </div>
            </div>
            <nav className={styles.sidebarMenu}>
                <ul>
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <Link 
                                to={item.path} 
                                className={`${styles.menuItem} ${location.pathname === item.path ? styles.active : ''}`} // Add active class
                            >
                                <img src={item.icon} alt={item.label} className={styles.menuIcon} />
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className={styles.divider} />
        </aside>
    );
}

export default Sidebar;
