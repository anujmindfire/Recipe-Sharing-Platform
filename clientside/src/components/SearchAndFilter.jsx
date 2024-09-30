import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from '../styles/searchAndFilter.module.css';
import { backendURL } from '../api/url';

const SearchAndFilter = ({ setRecipes, uniquePrepTimes, uniqueCookTimes, allRecipes, setTotalPages, setPage, page }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRating, setSelectedRating] = useState('');
    const [selectedPrepTime, setSelectedPrepTime] = useState('');
    const [selectedCookTime, setSelectedCookTime] = useState('');
    const [notFound, setNotFound] = useState(false);

    const accesstoken = localStorage.getItem('accesstoken');
    const refreshtoken = localStorage.getItem('refreshtoken');
    const userId = localStorage.getItem('id');

    const debounceRef = useRef();

    const fetchRecipes = useCallback(async (queryParams) => {
        setIsLoading(true);
        setNotFound(false);
        try {
            const response = await fetch(`${backendURL}/recipe?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    accesstoken,
                    refreshtoken,
                    id: userId,
                },
            });

            const data = await response.json();

            if (response.ok) {
                if (data.data && data.data.length > 0) {
                    setRecipes(data.data);
                    const newTotalPages = Math.ceil((data.total || 0) / 10);
                    setTotalPages(newTotalPages);
                    setPage(newTotalPages < page ? newTotalPages : 1);
                } else {
                    setRecipes([]);
                    setNotFound(true);
                }
            } else {
                setRecipes(allRecipes);
            }
        } catch (error) {
            setRecipes(allRecipes);
        } finally {
            setIsLoading(false);
        }
    }, [accesstoken, refreshtoken, userId, setRecipes, allRecipes, setTotalPages, setPage, page]);

    // Debounce for search and filter changes
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            const queryParams = new URLSearchParams({
                ...(searchQuery && { searchKey: searchQuery }),
                ...(selectedRating && { ratingValue: selectedRating }),
                ...(selectedPrepTime && { preparationTime: selectedPrepTime }),
                ...(selectedCookTime && { cookingTime: selectedCookTime }),
                ...(selectedPrepTime || selectedCookTime ? { page } : {}),
            }).toString();

            if (queryParams) {
                fetchRecipes(queryParams);
            } else {
                setRecipes(allRecipes);
                setNotFound(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [searchQuery, selectedRating, selectedPrepTime, selectedCookTime, allRecipes, fetchRecipes, setRecipes, page]);

    const handleFilterChange = (e, filterType) => {
        const value = e.target.value;

        if (filterType === 'prepTime') {
            setSelectedPrepTime(value);
        } else if (filterType === 'cookTime') {
            setSelectedCookTime(value);
        } else if (filterType === 'rating') {
            setSelectedRating(value);
            setSelectedPrepTime('');
            setSelectedCookTime('');
        }
    };

    const normalizeTime = (time) => parseInt(time.replace(/\D/g, ''), 10);
    const sortTimes = (times) => times.sort((a, b) => normalizeTime(a) - normalizeTime(b));

    return (
        <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
                <form className={styles.searchBar}>
                    <div className={styles.iconContainer}>
                        <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/7380ed3914a992a232415251fa2b996eeaec2006f9f71e93479332b3c9901fae?placeholderIfAbsent=true&apiKey=2ac8b4a54abb47edaafca4375aaa23ca"
                            className={styles.searchIcon}
                            alt=""
                        />
                    </div>
                    <label htmlFor="recipeSearch" className={styles['visually-hidden']}>
                        Search recipes
                    </label>
                    <input
                        type="text"
                        id="recipeSearch"
                        className={styles.searchInput}
                        placeholder="Search recipes..."
                        aria-label="Search recipes"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>

            {isLoading && <p>Loading...</p>}
            {notFound && <p className={styles.noDataMessage}>No recipes found.</p>}

            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Rating:</label>
                    <select
                        value={selectedRating}
                        onChange={(e) => handleFilterChange(e, 'rating')}
                        className={styles.filterDropdown}
                    >
                        <option value="">Ratings</option>
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <option key={rating} value={rating}>{rating} Stars</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Preparation Time:</label>
                    <select
                        value={selectedPrepTime}
                        onChange={(e) => handleFilterChange(e, 'prepTime')}
                        className={styles.filterDropdown}
                    >
                        <option value="">Times</option>
                        {sortTimes(uniquePrepTimes).map((time) => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Cooking Time:</label>
                    <select
                        value={selectedCookTime}
                        onChange={(e) => handleFilterChange(e, 'cookTime')}
                        className={styles.filterDropdown}
                    >
                        <option value="">Times</option>
                        {sortTimes(uniqueCookTimes).map((time) => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default SearchAndFilter;
