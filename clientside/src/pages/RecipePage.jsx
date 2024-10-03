import React, { useEffect, useState, useCallback } from 'react';
import styles from '../styles/recipePage.module.css';
import Header from '../components/Header';
import RecipeCard from '../components/RecipeCard';
import Button from '../components/Button';
import NewRecipeModal from '../components/NewRecipeModal';
import withAuthentication from '../utils/withAuthenicate';
import { backendURL } from '../api/url';
import Loader from '../components/Loader';
import Snackbar from '../components/Snackbar';
import ErrorModal from '../components/ErrorModal';

const RecipePage = () => {
    const [recipes, setRecipes] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uniquePrepTimes, setUniquePrepTimes] = useState([]);
    const [uniqueCookTimes, setUniqueCookTimes] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [searchParams, setSearchParams] = useState({
        query: '',
        rating: '',
        prepTime: '',
        cookTime: '',
    });
    const [notFound, setNotFound] = useState(false);

    const accesstoken = localStorage.getItem('accesstoken');
    const refreshtoken = localStorage.getItem('refreshtoken');
    const userId = localStorage.getItem('id');

    const parseTimeString = (timeString) => {
        const [value, unit] = timeString.split(' ');
        const timeInMinutes = (unit === 'hour' || unit === 'hours') ? parseInt(value) * 60 : parseInt(value);
        return timeInMinutes; // Convert all times to minutes for easier sorting
    };

    const fetchRecipes = useCallback(async () => {
        setIsLoading(true);
        setShowErrorModal(false);
        const { query, rating, prepTime, cookTime } = searchParams;

        try {
            const response = await fetch(`${backendURL}/recipe?page=${page}${query ? '' : '&limit=30'}&searchKey=${query}&ratingValue=${rating}&preparationTime=${prepTime}&cookingTime=${cookTime}`, {
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
                setRecipes(prev => (page === 1 ? data.data : [...prev, ...data.data]));
                setTotalPages(Math.ceil(data.total / 30));

                const prepTimes = [...new Set(data.data.map(item => item.preparationTime).filter(time => time))];
                const cookTimes = [...new Set(data.data.map(item => item.cookingTime).filter(time => time))];

                setUniquePrepTimes(sortTimes(prepTimes));
                setUniqueCookTimes(sortTimes(cookTimes));

                setNotFound(data.data.length === 0);
            } else if (data.message) {
                setErrorMessage(data.message);
                setShowErrorModal(true);
            }
        } catch (error) {
            setErrorMessage('Something went wrong while fetching recipes.');
            setShowErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    }, [accesstoken, refreshtoken, userId, page, searchParams]);

    const sortTimes = (times) => {
        return times.sort((a, b) => parseTimeString(a) - parseTimeString(b));
    };

    useEffect(() => {
        fetchRecipes();
    }, [page, fetchRecipes]);

    useEffect(() => {
        const handleScroll = () => {
            const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
            if (bottom && !isLoading && page < totalPages) {
                setPage(prev => prev + 1);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading, page, totalPages]);

    const handleNewRecipeClick = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const handleSnackbarClose = () => setShowSnackbar(false);
    const handleErrorModalClose = () => {
        setShowErrorModal(false);
        setErrorMessage('');
    };

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
        setPage(1);
        setRecipes([]);
    };

    return (
        <div className={styles.recipeApp}>
            <Header />
            <main className={styles.mainContent}>
                <div className={styles.searchContainer}>
                    <div className={styles.searchWrapper}>
                        <form className={styles.searchBar}>
                            <input
                                type='text'
                                name='query'
                                className={styles.searchInput}
                                placeholder='Search recipes...'
                                value={searchParams.query}
                                onChange={handleSearchChange}
                            />
                        </form>
                    </div>

                    <div className={styles.filters}>
                        <div className={styles.filterGroup}>
                            <label>Rating:</label>
                            <select
                                name='rating'
                                value={searchParams.rating}
                                onChange={handleSearchChange}
                                className={styles.filterDropdown}
                            >
                                <option value=''>Ratings</option>
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <option key={rating} value={rating}>{rating} Stars</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label>Preparation Time:</label>
                            <select
                                name='prepTime'
                                value={searchParams.prepTime}
                                onChange={handleSearchChange}
                                className={styles.filterDropdown}
                            >
                                <option value=''>Times</option>
                                {sortTimes([...uniquePrepTimes]).map((time) => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label>Cooking Time:</label>
                            <select
                                name='cookTime'
                                value={searchParams.cookTime}
                                onChange={handleSearchChange}
                                className={styles.filterDropdown}
                            >
                                <option value=''>Times</option>
                                {sortTimes([...uniqueCookTimes]).map((time) => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.newRecipeButtonContainer}>
                    <Button variant='primary' onClick={handleNewRecipeClick}>
                        ADD NEW
                    </Button>
                </div>

                {isLoading && !notFound && <Loader className={styles.loaderContainer} />}
                {notFound && <p className={styles.noDataMessage}>No recipes found</p>}
                <RecipeCard recipes={recipes} />
                {isModalOpen && <NewRecipeModal onClose={handleCloseModal} />}
                <Snackbar isVisible={showSnackbar} onClose={handleSnackbarClose} />
                {showErrorModal && <ErrorModal message={errorMessage} onClose={handleErrorModalClose} />}
            </main>
        </div>
    );
};

export default withAuthentication(RecipePage);