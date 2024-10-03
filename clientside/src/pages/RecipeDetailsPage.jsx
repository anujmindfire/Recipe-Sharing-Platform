import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/recipeDetailsPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as heartRegular } from '@fortawesome/free-regular-svg-icons';
import { faHeart as heartSolid } from '@fortawesome/free-solid-svg-icons';
import { faShareNodes as solidShare, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { backendURL } from '../api/url';
import Header from '../components/Header';
import Button from '../components/Button';
import Snackbar from '../components/Snackbar';
import ErrorModal from '../components/ErrorModal';
import Loader from '../components/Loader';

const RecipeDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

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
                        accesstoken,
                        refreshtoken,
                        id: userId,
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    setRecipe(data.data);
                } else if (data.message) {
                    setError(data.message);
                    setShowModal(true);
                }
            } catch {
                setError('Unable to connect to the server. Please check your internet connection.');
                setShowModal(true);
            }
            setIsLoading(false);
        };

        fetchRecipeDetails();
    }, [id, accesstoken, refreshtoken, userId]);

    const isDisabled = feedbackRating === 0 || feedbackComment.trim() === '';

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${backendURL}/recipefeedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    accesstoken,
                    refreshtoken,
                    id: userId,
                },
                body: JSON.stringify({ recipeId: id, ratingValue: feedbackRating, commentText: feedbackComment }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message);
                setShowSnackbar(true);
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else if (data.message) {
                setError(data.message);
                setShowModal(true);
            }
        } catch (error) {
            setError('Something went wrong while submitting feedback.');
            setShowModal(true);
        }
    };

    const handleShareRecipe = () => {
        if (navigator.share) {
            navigator.share({
                title: recipe?.title,
                url: window.location.href,
            })
        }
    };

    const toggleLike = () => {
        setIsLiked((prev) => !prev);
        setSuccessMessage(isLiked ? 'Removed from favorites.' : 'Added to favorites.');
        setShowSnackbar(true);
    };

    if (isLoading) return (
        <div className={styles.loaderContainer}>
            <Loader />
        </div>
    );

    if (showModal) {
        return (
            <ErrorModal
                message={error}
                onClose={() => {
                    setShowModal(false);
                    setError('');
                }}
            />
        );
    }

    if (!recipe) return <p>Recipe not found</p>;

    const { title, description, imageUrl, preparationTime, cookingTime, ingredients, steps } = recipe.recipe;
    const ratingPercentages = recipe.ratingPercentages;
    const feedbackData = recipe.feedbackData || [];

    return (
        <main className={styles.recipeReview}>
            {recipe && (
                <>
                    <Header />
                    <article className={styles.recipeContent}>
                        <section className={styles.recipeHeader}>
                            <FontAwesomeIcon
                                icon={faArrowLeft}
                                onClick={() => navigate(-1)}
                                style={{ cursor: 'pointer', color: 'black', marginLeft: '20px' }}
                            />
                            <figure className={styles.recipeImageContainer}>
                                <img src={imageUrl} alt={title} className={styles.recipeFullImage} />
                            </figure>
                            <div className={styles.titleContainer}>
                                <h2 className={styles.recipeTitle}>
                                    {title}
                                </h2>
                                <div className={styles.iconContainer}>
                                    <FontAwesomeIcon
                                        icon={isLiked ? heartSolid : heartRegular}
                                        className={`${styles.heartIcon} ${isLiked ? styles.liked : ''}`}
                                        onClick={toggleLike}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <FontAwesomeIcon
                                        icon={solidShare}
                                        onClick={handleShareRecipe}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </div>
                            </div>
                            <p className={styles.recipeDescription}>{description}</p>
                            <div className={styles.recipeMetaInfo}>
                                <div className={styles.metaItem}>
                                    <h3 className={styles.metaTitle}>Preparation Time</h3>
                                    <p className={styles.metaValue}>{preparationTime}</p>
                                </div>
                                <div className={styles.metaItem}>
                                    <h3 className={styles.metaTitle}>Cooking Time</h3>
                                    <p className={styles.metaValue}>{cookingTime}</p>
                                </div>
                            </div>
                        </section>

                        <section className={styles.recipeIngredients}>
                            <h3 className={styles.ingredientsTitle}>Ingredients</h3>
                            <ul className={styles.ingredientsList}>
                                {ingredients.map((ingredient, index) => (
                                    <li key={index}>{ingredient}</li>
                                ))}
                            </ul>
                        </section>

                        <section className={styles.recipeSteps}>
                            <h3 className={styles.stepsTitle}>Steps</h3>
                            {steps.map((step, index) => (
                                <div key={index} className={styles.stepItem}>
                                    <h4 className={styles.stepTitle}>Step {index + 1}</h4>
                                    <p className={styles.stepDescription}>{step}</p>
                                </div>
                            ))}
                        </section>

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
                                    <Button w='300px' type='submit' disabled={isDisabled || isLoading || feedbackRating === 0}>
                                        Submit
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

                    <Snackbar
                        message={successMessage}
                        isVisible={showSnackbar}
                        onClose={() => setShowSnackbar(false)}
                    />
                </>
            )}
        </main>
    );
};

export default RecipeDetailsPage;