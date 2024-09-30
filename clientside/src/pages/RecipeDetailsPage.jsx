import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../styles/recipeDetailsPage.module.css';
import { backendURL } from '../api/url';
import Header from '../components/Header';
import Button from '../components/Button';

const RecipeDetailsPage = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');

    const accesstoken = localStorage.getItem('accesstoken');
    const refreshtoken = localStorage.getItem('refreshtoken');
    const userId = localStorage.getItem('id');

    useEffect(() => {
        const fetchRecipeDetails = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${backendURL}/recipe?_id=${id}`, {
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
                    setRecipe(data.data);
                } else {
                    setError('Failed to fetch recipe details.');
                    return;
                }
            } catch (error) {
                alert('Something went wrong');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecipeDetails();
    }, [id, accesstoken, refreshtoken, userId]);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();

        // Check if rating is provided
        if (feedbackRating === 0) {
            alert('Rating is required.');
            return;
        }

        try {
            const response = await fetch(`${backendURL}/recipefeedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accesstoken': accesstoken,
                    'refreshtoken': refreshtoken,
                    'id': userId,
                },
                body: JSON.stringify({
                    recipeId: id,
                    ratingValue: feedbackRating,
                    commentText: feedbackComment,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                window.location.reload();
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Something went wrong');
        }
    };

    if (isLoading) return <p>Loading...</p>;
    if (!recipe) return <p>Recipe not found</p>;
    if (error) return <p>{error}</p>;

    const recipeSteps = recipe.recipe.steps || [];
    const ratingPercentages = recipe.ratingPercentages;
    const feedbackData = recipe.feedbackData || [];

    return (
        <main className={styles.recipeReview}>
            <Header />
            <article className={styles.recipeContent}>
                <section className={styles.recipeHeader}>
                    <div className={styles.recipeImageContainer}>
                        <img src={recipe.recipe.imageUrl} alt={recipe.recipe.title} className={styles.recipeFullImage} />
                    </div>
                    <h2 className={styles.recipeTitle}>{recipe.recipe.title}</h2>
                    <p className={styles.recipeDescription}>{recipe.recipe.description}</p>
                    <div className={styles.recipeMetaInfo}>
                        <div className={styles.metaItem}>
                            <h3 className={styles.metaTitle}>Preparation Time</h3>
                            <p className={styles.metaValue}>{recipe.recipe.preparationTime}</p>
                        </div>
                        <div className={styles.metaItem}>
                            <h3 className={styles.metaTitle}>Cooking Time</h3>
                            <p className={styles.metaValue}>{recipe.recipe.cookingTime}</p>
                        </div>
                    </div>
                </section>

                <section className={styles.recipeIngredients}>
                    <h3 className={styles.ingredientsTitle}>Ingredients</h3>
                    <ul className={styles.ingredientsList}>
                        {recipe.recipe.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                </section>

                <section className={styles.recipeSteps}>
                    <h3 className={styles.stepsTitle}>Steps</h3>
                    {recipeSteps.map((step, index) => (
                        <div key={index} className={styles.stepItem}>
                            <h4 className={styles.stepTitle}>Step {index + 1}</h4>
                            <p className={styles.stepDescription}>{step}</p>
                        </div>
                    ))}
                </section>

                {/* Rating Overview Section */}
                <section className={styles.ratingOverview}>
                    <div className={styles.overallRating}>
                        <h3 className={styles.ratingScore}>{recipe.averageRating}</h3>
                        <div className={styles.starRating}>
                            {[...Array(5)].map((_, starIndex) => (
                                <span key={starIndex} className={styles.starIcon}>
                                    {starIndex < Math.round(recipe.averageRating) ? '★' : '☆'}
                                </span>
                            ))}
                        </div>
                        <p className={styles.reviewCount}>{recipe.totalRating} reviews</p>
                    </div>
                    <div className={styles.ratingDistribution}>
                        {Array.from({ length: 5 }, (_, index) => {
                            const rating = 5 - index;
                            return (
                                <div className={styles.ratingBar} key={rating}>
                                    <span className={styles.ratingLabel}>{rating}</span>
                                    <div className={styles.ratingBarContainer}>
                                        <div
                                            className={styles.ratingBarFill}
                                            style={{ width: `${ratingPercentages[`rating${rating}`]}%` }}
                                        />
                                    </div>
                                    <span className={styles.ratingPercentage}>{ratingPercentages[`rating${rating}`]}%</span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Feedback Form Section */}
                <section className={styles.feedbackForm}>
                    <h3 className={styles.feedbackTitle}>Leave a Review</h3>
                    <form onSubmit={handleFeedbackSubmit} className={styles.feedbackFormContainer}>
                        <div className={styles.ratingSelection}>
                            {[...Array(5)].map((_, starIndex) => (
                                <span key={starIndex} className={styles.starIcon} onClick={() => setFeedbackRating(starIndex + 1)}>
                                    {starIndex < feedbackRating ? '★' : '☆'}
                                </span>
                            ))}
                        </div>
                        <textarea
                            className={styles.feedbackTextBox}
                            placeholder="Write your feedback here..."
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            required
                        />
                        <div className={styles.newFeedbackButtonContainer}>
                            <Button
                                variant="primary"
                                type="submit"
                            >
                                SUBMIT
                            </Button>
                        </div>
                    </form>
                </section>

                {/* Reviews Section */}
                <section className={styles.reviews}>
                    <h3>Reviews</h3>
                    {feedbackData.length > 0 ? (
                        feedbackData.map((feedback, index) => (
                            <article key={index} className={styles.reviewItem}>
                                <div className={styles.reviewHeader}>
                                    <div className={styles.profileCircle}>
                                        {feedback.userId.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={styles.reviewerInfo}>
                                        <h3 className={styles.reviewerName}>{feedback.userId.name}</h3>
                                        <time className={styles.reviewDate}>{new Date(feedback.createdAt).toLocaleDateString()}</time>
                                    </div>
                                </div>
                                <div className={styles.reviewRating}>
                                    {[...Array(5)].map((_, starIndex) => (
                                        <span key={starIndex} className={styles.starIcon}>
                                            {starIndex < feedback.ratingValue ? '★' : '☆'}
                                        </span>
                                    ))}
                                </div>
                                <p className={styles.reviewComment}>{feedback.commentText}</p>
                            </article>
                        ))
                    ) : (
                        <p>No reviews yet.</p>
                    )}
                </section>
            </article>
        </main>
    );
};

export default RecipeDetailsPage;
