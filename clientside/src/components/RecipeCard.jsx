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
                    className={styles.cardContainer} 
                    onClick={() => handleCardClick(recipe._id)}
                >
                    <div
                        className={styles.imageContainer}
                        style={{
                            backgroundImage: `url(${recipe.imageUrl})`,
                        }}
                    ></div>
                    <div className={styles.textContainer}>
                        <h2 className={styles.title}>{recipe.title}</h2>
                    </div>
                </article>
            ))}
        </section>
    );
};

export default RecipeCard;