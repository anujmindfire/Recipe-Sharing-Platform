import React from 'react';
import styles from '../styles/footer.module.css';
import { Link } from 'react-router-dom';

const navLinks = [
    { name: 'About Us', url: '/about' },
    { name: 'Contact Us', url: '/contact' },
    { name: 'Privacy Policy', url: '/privacy-policy' }
];

const socialIcons = [
    { src: 'https://cdn.builder.io/api/v1/image/assets/TEMP/29ecd9aa02629047e9bd8e1a4c1950a2005fb1862a185724a1cf7855c57d24b6?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca', alt: 'Social Media Icon 1' },
    { src: 'https://cdn.builder.io/api/v1/image/assets/TEMP/bd6f8933af93727353750918b9beb1ef2b963d0bcf29ab440b24411f2b211902?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca', alt: 'Social Media Icon 2' },
    { src: 'https://cdn.builder.io/api/v1/image/assets/TEMP/8a762fe549e6948d7662e4bebde35e14044ef2403e0d38bdc2d218ec279df586?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca', alt: 'Social Media Icon 3' },
    { src: 'https://cdn.builder.io/api/v1/image/assets/TEMP/4ce689fe9e47a9f314f5b02cda106451397c4158237336c39c5c7c5fdc48a48d?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca', alt: 'Social Media Icon 4' }
];

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <nav className={styles.navLinks}>
                {navLinks.map((link, index) => (
                    <Link key={index} to={link.url} className={styles.navLink}>
                        {link.name}
                    </Link>
                ))}
            </nav>
            <div className={styles.socialIcons}>
                {socialIcons.map((icon, index) => (
                    <div key={index} className={styles.iconWrapper}>
                        <img loading="lazy" src={icon.src} alt={icon.alt} className={styles.icon} />
                    </div>
                ))}
            </div>
            <p className={styles.copyright}>©2024 Foodies. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
