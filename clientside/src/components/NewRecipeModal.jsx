import React, { useState, useEffect } from 'react';
import styles from '../styles/newRecipeModal.module.css';
import Button from './Button';
import { backendURL } from '../api/url';

const CreateRecipeModal = ({ onClose }) => {
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [steps, setSteps] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [preparationTime, setPreparationTime] = useState('');
    const [cookingTime, setCookingTime] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const accesstoken = localStorage.getItem('accesstoken');
    const refreshtoken = localStorage.getItem('refreshtoken');
    const userId = localStorage.getItem('id');

    const [imageUploadStatus, setImageUploadStatus] = useState('Select recipe image to upload');

    const handleImageChange = async (e) => {
        const selectedImage = e.target.files[0];

        // Call /getS3Url API to get the URL
        if (selectedImage) {
            const validImageTypes = ['image/jpeg', 'image/png'];
            if (!validImageTypes.includes(selectedImage.type)) {
                alert('Invalid file type. Please select a JPEG or PNG image.');
                setImageUploadStatus('Select recipe image to upload');
                return;
            }

            const formData = new FormData();
            formData.append('image', selectedImage);

            try {
                const response = await fetch(`${backendURL}/getS3Url`, {
                    method: 'POST',
                    body: formData,
                });

                console.log('response', response);
                const result = await response.json();

                if (response.ok) {
                    setImageUrl(result.imageUrl);
                    setImageUploadStatus('Upload successful');
                } else {
                    alert(`Error getting image URL: ${result.message}`);
                    setImageUploadStatus('Select recipe image to upload');
                }
            } catch (error) {
                alert('Something went wrong');
                setImageUploadStatus('Select recipe image to upload');
            }
        }
    };

    const validateFields = () => {
        const newErrors = {};
        if (!title) newErrors.title = 'Title is required.';
        if (!ingredients) newErrors.ingredients = 'Ingredients are required.';
        if (!steps) newErrors.steps = 'Steps are required.';
        if (!imageUrl) newErrors.image = 'Image is required.';
        if (!preparationTime) newErrors.preparationTime = 'Preparation time is required.';
        if (!cookingTime) newErrors.cookingTime = 'Cooking time is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateRecipe = async (e) => {
        e.preventDefault();
        if (validateFields()) {
            const recipeData = {
                title,
                ingredients: ingredients.split(',').map(item => item.trim()),
                steps: steps.split(',').map(item => item.trim()),
                imageUrl,
                preparationTime,
                cookingTime,
                description,
            };

            setIsSubmitting(true);

            try {
                const response = await fetch(`${backendURL}/recipe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'accesstoken': accesstoken,
                        'refreshtoken': refreshtoken,
                        'id': userId,
                    },
                    body: JSON.stringify(recipeData),
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    onClose();
                } else {
                    alert(result.message);
                }
            } catch (error) {
                alert('Something went wrong');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    useEffect(() => {
    }, [title, ingredients, steps, description, imageUrl, preparationTime, cookingTime, errors, isSubmitting]);

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>Create Recipe</h2>
                <hr className={styles.divider} />
                <form className={styles.recipeForm} onSubmit={handleCreateRecipe}>
                    <div className={styles.formContainer}>
                        <div className={styles.formContent}>
                            <div className={styles.formFields}>
                                {/* Title Input Field */}
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputField}>
                                        <label className={styles['visually-hidden']} htmlFor="recipe-title">Enter recipe title</label>
                                        <input
                                            type="text"
                                            id="recipe-title"
                                            className={styles.textInput}
                                            placeholder="Enter recipe title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            aria-label="Recipe title"
                                        />
                                        {errors.title && <p>{errors.title}</p>}
                                    </div>
                                </div>

                                {/* Ingredients Input Field */}
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputField}>
                                        <label className={styles['visually-hidden']} htmlFor="recipe-ingredients">List ingredients</label>
                                        <textarea
                                            id="recipe-ingredients"
                                            className={styles.textareaInput}
                                            placeholder="List ingredients (comma separated)"
                                            value={ingredients}
                                            onChange={(e) => setIngredients(e.target.value)}
                                            aria-label="Recipe ingredients"
                                        />
                                        {errors.ingredients && <p >{errors.ingredients}</p>}
                                    </div>
                                </div>

                                {/* Steps Input Field */}
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputField}>
                                        <label className={styles['visually-hidden']} htmlFor="recipe-steps">Describe the steps</label>
                                        <textarea
                                            id="recipe-steps"
                                            className={styles.textareaInput}
                                            placeholder="Describe the steps (comma separated)"
                                            value={steps}
                                            onChange={(e) => setSteps(e.target.value)}
                                            aria-label="Recipe steps"
                                        />
                                        {errors.steps && <p>{errors.steps}</p>}
                                    </div>
                                </div>

                                {/* Description Input Field */}
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputField}>
                                        <label className={styles['visually-hidden']} htmlFor="recipe-description">Enter recipe description</label>
                                        <textarea
                                            id="recipe-description"
                                            className={styles.textareaInput}
                                            placeholder="Enter recipe description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            aria-label="Recipe description"
                                        />
                                        {errors.description && <p>{errors.description}</p>}
                                    </div>
                                </div>

                                {/* Image Upload Field */}
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputField}>
                                        <div className={styles.imageUploadWrapper}>
                                            <label htmlFor="recipe-image" className={styles.imageUploadText}>{imageUploadStatus}</label>
                                            <div className={styles.imageUploadButton}>
                                                <input
                                                    id="recipe-image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    aria-label="Upload recipe image"
                                                />
                                            </div>
                                        </div>
                                        {errors.image && <p>{errors.image}</p>}
                                    </div>
                                </div>

                                {/* Preparation Time Input Field */}
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputField}>
                                        <label className={styles['visually-hidden']} htmlFor="recipe-preparation-time">Preparation time</label>
                                        <input
                                            type="text"
                                            id="recipe-preparation-time"
                                            className={styles.textInput}
                                            placeholder="Preparation time (e.g., 30 minutes)"
                                            value={preparationTime}
                                            onChange={(e) => setPreparationTime(e.target.value)}
                                            aria-label="Preparation time"
                                        />
                                        {errors.preparationTime && <p>{errors.preparationTime}</p>}
                                    </div>
                                </div>

                                {/* Cooking Time Input Field */}
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputField}>
                                        <label className={styles['visually-hidden']} htmlFor="recipe-cooking-time">Cooking time</label>
                                        <input
                                            type="text"
                                            id="recipe-cooking-time"
                                            className={styles.textInput}
                                            placeholder="Cooking time (e.g., 45 minutes)"
                                            value={cookingTime}
                                            onChange={(e) => setCookingTime(e.target.value)}
                                            aria-label="Cooking time"
                                        />
                                        {errors.cookingTime && <p>{errors.cookingTime}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.buttonContainer}>
                            <div className={styles.buttonFlex}>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'CREATE'}
                                </Button>
                                <Button type="button" variant="secondary" onClick={onClose}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRecipeModal;
