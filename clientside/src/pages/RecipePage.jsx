import React, { useEffect, useState, useCallback } from 'react';
import styles from '../styles/recipeCard.module.css';
import Header from '../components/Header';
import SearchAndFilter from '../components/SearchAndFilter';
import RecipeCard from '../components/RecipeCard';
import Pagination from '../components/Pagination';
import Button from '../components/Button';
import NewRecipeModal from '../components/NewRecipeModal';
import withAuthentication from '../utils/withAuthenicate';
import { backendURL } from '../api/url';

const RecipePage = () => {
    const [recipes, setRecipes] = useState([]);
    const [allRecipes, setAllRecipes] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uniquePrepTimes, setUniquePrepTimes] = useState([]);
    const [uniqueCookTimes, setUniqueCookTimes] = useState([]);

    const accesstoken = localStorage.getItem('accesstoken');
    const refreshtoken = localStorage.getItem('refreshtoken');
    const userId = localStorage.getItem('id');

    const fetchRecipes = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${backendURL}/recipe?page=${page}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'accesstoken': accesstoken,
                    'refreshtoken': refreshtoken,
                    'id': userId,
                },
            });

            const data = await response.json();
            if (response.ok) {
                if (data.accesstoken) {
                    localStorage.setItem('accesstoken', data.accesstoken);
                }
                setAllRecipes(data.data || []);
                setRecipes(data.data || []);
                setTotalPages(Math.ceil(data.total / 10));

                const prepTimes = [...new Set(data.data.map(item => item.preparationTime))];
                const cookTimes = [...new Set(data.data.map(item => item.cookingTime))];
                setUniquePrepTimes(prepTimes);
                setUniqueCookTimes(cookTimes);
            } else {
                alert(data.message);
                return;
            }
        } catch (error) {
            alert('Something went wrong');
            setRecipes([]);
        } finally {
            setIsLoading(false);
        }
    }, [accesstoken, refreshtoken, userId, page]);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes, page]);
    
    const handleNewRecipeClick = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    return (
        <div className={styles.recipeApp}>
            <Header />
            <main className={styles.mainContent}>
                <SearchAndFilter
                    uniquePrepTimes={uniquePrepTimes}
                    uniqueCookTimes={uniqueCookTimes}
                    setRecipes={setRecipes}
                    allRecipes={allRecipes}
                    setTotalPages={setTotalPages}
                    setPage={setPage}
                    page={page}
                />
                <div className={styles.newRecipeButtonContainer}>
                    <Button variant="primary" onClick={handleNewRecipeClick}>
                        ADD NEW
                    </Button>
                </div>
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <RecipeCard recipes={recipes} />
                        {totalPages > 1 && recipes.length > 0 && (
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={(newPage) => {
                                    if (newPage <= totalPages && newPage > 0) {
                                        setPage(newPage);
                                    }
                                }}
                            />
                        )}
                    </>
                )}
                {isModalOpen && <NewRecipeModal onClose={handleCloseModal} />}
            </main>
        </div>
    );
};

export default withAuthentication(RecipePage);