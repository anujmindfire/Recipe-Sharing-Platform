import React from 'react';
import styles from '../styles/pagination.module.css';

const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
    const previousButtonImg = "https://cdn.builder.io/api/v1/image/assets/TEMP/50ee214ca0400116c5d1b98fcd3690165996e0a044313f6f44e459f6a1d19a09?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca";
    const nextButtonImg = "https://cdn.builder.io/api/v1/image/assets/TEMP/1aff7261835ecbb3710123a04190633d4125393b55011ab9d58b14d46b02c482?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca";

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const renderPageButtons = () => (
        Array.from({ length: totalPages }, (_, index) => (
            <button
                key={index + 1}
                className={`${styles.paginationButton} ${currentPage === index + 1 ? styles.active : ''}`}
                onClick={() => handlePageChange(index + 1)}
            >
                {index + 1}
            </button>
        ))
    );

    return (
        <nav className={styles.pagination} aria-label="Pagination">
            <button
                className={styles.paginationButton}
                aria-label="Previous page"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <img src={previousButtonImg} alt="Previous" className={styles.paginationIcon} />
            </button>

            {renderPageButtons()}

            <button
                className={styles.paginationButton}
                aria-label="Next page"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <img src={nextButtonImg} alt="Next" className={styles.paginationIcon} />
            </button>
        </nav>
    );
});

export default Pagination;
