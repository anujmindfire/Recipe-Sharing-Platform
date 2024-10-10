import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import RecipeCard from './RecipeCard';
import SearchFilterBar from './SearchFilterBar';
import { backendURL } from '../api/url';
import Loader from './Loader';
import Snackbar from './Snackbar';
import ErrorModal from './ErrorModal';
import { refreshAccessToken } from '../utils/tokenServices';
import withAuthentication from '../utils/withAuthenicate';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/profilePage.module.css';

const MyRecipe = () => {
    const initialSearchParams = useMemo(() => ({
        query: '',
        rating: '',
        prepTime: '',
        cookTime: '',
    }), []);

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
        searchParams: initialSearchParams,
        notFound: false,
    });

    const { recipes, totalPages, page, isLoading, allUniquePrepTimes, allUniqueCookTimes, errorMessage, showErrorModal, showSnackbar, searchParams, notFound } = status;

    const accesstoken = localStorage.getItem('accesstoken');
    const refreshtoken = localStorage.getItem('refreshtoken');
    const userId = localStorage.getItem('id');

    const location = useLocation();
    const navigate = useNavigate();
    const mainContentRef = useRef(null);

    const parseTimeString = (timeString) => {
        const [value, unit] = timeString.split(' ');
        return (unit === 'hour' || unit === 'hours') ? parseInt(value) * 60 : parseInt(value);
    };

    const sortTimes = useCallback((times) => times.sort((a, b) => parseTimeString(a) - parseTimeString(b)), []);

    const handleFetchError = useCallback((data, response) => {
        if (response.status === 401 || data.unauthorized) {
            return refreshAccessToken(refreshtoken, userId, navigate);
        } else if (data.message) {
            setStatus((prev) => ({ ...prev, errorMessage: data.message, showErrorModal: true }));
        }
    }, [refreshtoken, userId, navigate]);

    const fetchRecipes = useCallback(async () => {
        setStatus((prevState) => ({ ...prevState, isLoading: true, showErrorModal: false }));
        const { query, rating, prepTime, cookTime } = searchParams;

        const url = location.pathname === '/profile/recipes'
            ? `${backendURL}/recipe?limit=20&creator=${userId}&page=${page}&searchKey=${query}&ratingValue=${rating}&preparationTime=${prepTime}&cookingTime=${cookTime}`
            : `${backendURL}/favorites?limit=20&page=${page}&searchKey=${query}&ratingValue=${rating}&preparationTime=${prepTime}&cookingTime=${cookTime}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    accesstoken,
                    id: userId,
                },
            });

            const data = await response.json();

            if (response.ok) {
                const newPrepTimes = [...new Set(data.data.map(item => item.preparationTime).filter(Boolean))];
                const newCookTimes = [...new Set(data.data.map(item => item.cookingTime).filter(Boolean))];

                setStatus((prev) => ({
                    ...prev,
                    recipes: page === 1 ? data.data : [...prev.recipes, ...data.data],
                    totalPages: Math.ceil(data.total / 20),
                    allUniquePrepTimes: sortTimes([...new Set([...prev.allUniquePrepTimes, ...newPrepTimes])]),
                    allUniqueCookTimes: sortTimes([...new Set([...prev.allUniqueCookTimes, ...newCookTimes])]),
                    notFound: data.data.length === 0,
                }));
            } else {
                handleFetchError(data, response);
            }
        } catch (error) {
            setStatus((prev) => ({ ...prev, errorMessage: 'Something went wrong while fetching recipes.', showErrorModal: true }));
        } finally {
            setStatus((prev) => ({ ...prev, isLoading: false }));
        }
    }, [accesstoken, userId, page, searchParams, sortTimes, handleFetchError, location.pathname]);

    useEffect(() => {
        setStatus((prev) => ({
            ...prev,
            searchParams: initialSearchParams,
            page: 1,
            recipes: [],
            allUniquePrepTimes: [],
            allUniqueCookTimes: [],
            notFound: false,
        }));
        window.scrollTo(0, 0);
    }, [location.pathname, initialSearchParams]);

    useEffect(() => {
        fetchRecipes();
    }, [page, searchParams, fetchRecipes]);

    useEffect(() => {
        const handleScroll = () => {
            if (mainContentRef.current) {
                const bottom = mainContentRef.current.scrollHeight - mainContentRef.current.scrollTop <= mainContentRef.current.clientHeight + 1;
                if (bottom && !isLoading && page < totalPages) {
                    setStatus((prev) => ({ ...prev, page: prev.page + 1 }));
                }
            }
        };

        const currentRef = mainContentRef.current;

        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isLoading, page, totalPages]);

    const handleSnackbarClose = () => setStatus((prev) => ({ ...prev, showSnackbar: false }));
    const handleErrorModalClose = () => setStatus((prev) => ({ ...prev, showErrorModal: false, errorMessage: '' }));

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setStatus((prevState) => ({
            ...prevState,
            searchParams: { ...prevState.searchParams, [name]: value },
            page: 1,
            recipes: [],
        }));
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div className={styles.scrollContainer} ref={mainContentRef}>
            <SearchFilterBar
                searchParams={searchParams}
                handleSearchChange={handleSearchChange}
                uniquePrepTimes={allUniquePrepTimes}
                uniqueCookTimes={allUniqueCookTimes}
                placeholder='Search Recipes ....'
            />

            {isLoading && !notFound && <Loader />}
            {notFound && <p className={styles.noDataMessage}>No recipes found</p>}
            <RecipeCard recipes={recipes} />
            <Snackbar isVisible={showSnackbar} onClose={handleSnackbarClose} />
            {showErrorModal && <ErrorModal message={errorMessage} onClose={handleErrorModalClose} />}
        </div>
    );
};

export default withAuthentication(MyRecipe);