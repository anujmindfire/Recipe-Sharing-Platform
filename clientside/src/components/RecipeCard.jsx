import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/recipeCard.module.css';

const RecipeCard = ({ recipes }) => {
    const navigate = useNavigate();

    const handleCardClick = (recipeId) => {
        navigate(`/recipe/${recipeId}`);
    };

    return (
        <section className={styles.recipeGrid}>
            {recipes.map((recipe) => (
                <article 
                    key={recipe._id} 
                    className={styles.recipeCard} 
                    onClick={() => handleCardClick(recipe._id)}
                >
                    <img src={recipe.imageUrl} alt={recipe.title} className={styles.recipeImage} />
                    <div className={styles.recipeInfo}>
                        <h2 className={styles.recipeTitle}>{recipe.title}</h2>
                    </div>
                </article>
            ))}
        </section>
    );
};

export default RecipeCard;
