import React, { useEffect, useState, useCallback } from 'react';
import RecipeCard from './RecipeCard';
import SearchFilterBar from './SearchFilterBar';
import { backendURL } from '../api/url';
import Loader from './Loader';
import Snackbar from './Snackbar';
import ErrorModal from './ErrorModal';
import { refreshAccessToken } from '../utils/tokenServices';
import withAuthentication from '../utils/withAuthenicate';
import { useLocation } from 'react-router-dom';
import styles from '../styles/recipePage.module.css';

const MyRecipe = () => {
    const [status, setStatus] = useState({
        recipes: [],
        totalPages: 0,
        page: 1,
        isLoading: false,
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

    const { recipes, totalPages, page, isLoading, allUniquePrepTimes, allUniqueCookTimes, errorMessage, showErrorModal, showSnackbar, searchParams, notFound } = status;

    const accesstoken = localStorage.getItem('accesstoken');
    const refreshtoken = localStorage.getItem('refreshtoken');
    const userId = localStorage.getItem('id');

    const location = useLocation();

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
            let response;
            if (location.pathname === '/profile/recipes') {
                response = await fetch(`${backendURL}/recipe?limit=20&creator=${userId}&page=${page}&searchKey=${query}&ratingValue=${rating}&preparationTime=${prepTime}&cookingTime=${cookTime}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        accesstoken,
                        id: userId,
                    },
                });
            } else if (location.pathname === '/profile/favourites') {
                response = await fetch(`${backendURL}/favorites?limit=20&page=${page}&searchKey=${query}&ratingValue=${rating}&preparationTime=${prepTime}&cookingTime=${cookTime}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        accesstoken,
                        id: userId,
                    },
                });
            }
    
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
            } else if (response.status === 401 || data.unauthorized) {
                const newAccessToken = await refreshAccessToken(refreshtoken, userId);
                if (newAccessToken) {
                    await fetchRecipes();
                }
            } else if (data.message && response.status !== 401) {
                setStatus((prevState) => ({ ...prevState, errorMessage: data.message, showErrorModal: true }));
            }
        } catch (error) {
            console.log(error);
            setStatus((prevState) => ({ ...prevState, errorMessage: 'Something went wrong while fetching recipes.', showErrorModal: true }));
        } finally {
            setStatus((prevState) => ({ ...prevState, isLoading: false }));
        }
    }, [accesstoken, userId, page, searchParams, refreshtoken, sortTimes, location.pathname]);

    useEffect(() => {
        fetchRecipes();
    }, [page, searchParams, fetchRecipes, location.pathname]);

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
            <SearchFilterBar
                searchParams={searchParams} 
                handleSearchChange={handleSearchChange}
                uniquePrepTimes={allUniquePrepTimes}
                uniqueCookTimes={allUniqueCookTimes}
            />

            {isLoading && !notFound && <Loader className={styles.loaderContainer} />}
            {notFound && <p className={styles.noDataMessage}>No recipes found</p>}
            <RecipeCard recipes={recipes} />
            <Snackbar isVisible={showSnackbar} onClose={handleSnackbarClose} />
            {showErrorModal && <ErrorModal message={errorMessage} onClose={handleErrorModalClose} />}
        </div>
    );
};

export default withAuthentication(MyRecipe);