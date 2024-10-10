import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/recipePage.module.css';
import RecipeCard from '../components/RecipeCard';
import Button from '../components/Button';
import NewRecipeModal from '../components/NewRecipeModal';
import SearchFilterBar from '../components/SearchFilterBar';
import withAuthentication from '../utils/withAuthenicate';
import { backendURL } from '../api/url';
import Loader from '../components/Loader';
import Snackbar from '../components/Snackbar';
import ErrorModal from '../components/ErrorModal';
import { refreshAccessToken } from '../utils/tokenServices';

const RecipePage = () => {
    const [status, setStatus] = useState({
        recipes: [],
        totalPages: 0,
        page: 1,
        isLoading: false,
        isModalOpen: false,
        allUniquePrepTimes: [],
        allUniqueCookTimes: [],
        errorMessage: '',
        showErrorModal: false,
        showSnackbar: false,
        searchParams: {
            query: '',
            rating: '',
            prepTime: '',
            cookTime: '',
        },
        notFound: false,
    });

    const navigate = useNavigate();
    const { recipes, totalPages, page, isLoading, isModalOpen, allUniquePrepTimes, allUniqueCookTimes, errorMessage, showErrorModal, showSnackbar, searchParams, notFound } = status;

    const accesstoken = localStorage.getItem('accesstoken');
    const refreshtoken = localStorage.getItem('refreshtoken');
    const userId = localStorage.getItem('id');

    const parseTimeString = (timeString) => {
        const [value, unit] = timeString.split(' ');
        return (unit === 'hour' || unit === 'hours') ? parseInt(value) * 60 : parseInt(value);
    };

    const sortTimes = useCallback((times) => {
        return times.sort((a, b) => parseTimeString(a) - parseTimeString(b));
    }, []);

    const fetchRecipes = useCallback(async () => {
        setStatus((prevState) => ({ ...prevState, isLoading: true, showErrorModal: false }));
        const { query, rating, prepTime, cookTime } = searchParams;

        try {
            const response = await fetch(`${backendURL}/recipe?page=${page}${query ? '' : '&limit=20'}&searchKey=${query}&ratingValue=${rating}&preparationTime=${prepTime}&cookingTime=${cookTime}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    accesstoken,
                    id: userId,
                },
            });

            const data = await response.json();
            if (response.ok) {
                const newPrepTimes = [...new Set(data.data.map(item => item.preparationTime).filter(time => time))];
                const newCookTimes = [...new Set(data.data.map(item => item.cookingTime).filter(time => time))];

                setStatus((prevState) => ({
                    ...prevState,
                    recipes: page === 1 ? data.data : [...prevState.recipes, ...data.data],
                    totalPages: Math.ceil(data.total / 20),
                    uniquePrepTimes: sortTimes(newPrepTimes),
                    uniqueCookTimes: sortTimes(newCookTimes),
                    allUniquePrepTimes: sortTimes([...new Set([...prevState.allUniquePrepTimes, ...newPrepTimes])]),
                    allUniqueCookTimes: sortTimes([...new Set([...prevState.allUniqueCookTimes, ...newCookTimes])]),
                    notFound: data.data.length === 0,
                }));
            } else if ((response.status === 401 || data.unauthorized)) {
                return await refreshAccessToken(refreshtoken, userId, navigate);
            } else if (data.message && response.status !== 401) {
                setStatus((prevState) => ({ ...prevState, errorMessage: data.message, showErrorModal: true }));
            }
        } catch (error) {
            setStatus((prevState) => ({ ...prevState, errorMessage: 'Something went wrong while fetching recipes.', showErrorModal: true }));
        } finally {
            setStatus((prevState) => ({ ...prevState, isLoading: false }));
        }
    }, [accesstoken, userId, page, searchParams, navigate, refreshtoken, sortTimes]);

    useEffect(() => {
        fetchRecipes();
    }, [page, searchParams, fetchRecipes]);

    useEffect(() => {
        const handleScroll = () => {
            const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
            if (bottom && !isLoading && page < totalPages) {
                setStatus((prevState) => ({ ...prevState, page: prevState.page + 1 }));
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading, page, totalPages]);

    const handleNewRecipeClick = () => setStatus((prevState) => ({ ...prevState, isModalOpen: true }));
    const handleCloseModal = () => setStatus((prevState) => ({ ...prevState, isModalOpen: false }));
    const handleSnackbarClose = () => setStatus((prevState) => ({ ...prevState, showSnackbar: false }));
    const handleErrorModalClose = () => setStatus((prevState) => ({ ...prevState, showErrorModal: false, errorMessage: '' }));

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setStatus((prevState) => ({
            ...prevState,
            searchParams: { ...prevState.searchParams, [name]: value },
            page: 1,
            recipes: [],
        }));
    };

    return (
        <div className={styles.recipeApp}>
            <main className={styles.mainContent}>
                <SearchFilterBar
                    searchParams={searchParams}
                    handleSearchChange={handleSearchChange}
                    uniquePrepTimes={allUniquePrepTimes}
                    uniqueCookTimes={allUniqueCookTimes}
                    placeholder='Search Recipes ....'
                />

                <div className={styles.newRecipeButtonContainer}>
                    <Button variant='primary' onClick={handleNewRecipeClick}>
                        ADD NEW
                    </Button>
                </div>

                {isLoading && !notFound && <Loader />}
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