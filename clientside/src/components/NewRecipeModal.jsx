import React, { useState } from 'react';
import styles from '../styles/newRecipeModal.module.css';
import Button from './Button';
import { backendURL } from '../api/url';
import ErrorModal from './ErrorModal';
import Snackbar from './Snackbar';
import { Tooltip } from '@chakra-ui/react';

const CreateRecipeModal = ({ onClose }) => {
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [steps, setSteps] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [preparationTime, setPreparationTime] = useState('');
    const [cookingTime, setCookingTime] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Focus states
    const [isTitleFocused, setIsTitleFocused] = useState(false);
    const [isIngredientsFocused, setIsIngredientsFocused] = useState(false);
    const [isStepsFocused, setIsStepsFocused] = useState(false);
    const [isImageFocused, setIsImageFocused] = useState(false);
    const [isPreparationTimeFocused, setIsPreparationTimeFocused] = useState(false);
    const [isCookingTimeFocused, setIsCookingTimeFocused] = useState(false);

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

                const data = await response.json();

                if (response.ok) {
                    setImageUrl(data.imageUrl);
                    setImageUploadStatus('Upload successful');
                } else {
                    setErrorMessage(`Error getting image URL: ${data.message}`);
                    setShowErrorModal(true);
                    setImageUploadStatus('Select recipe image to upload');
                }
            } catch (error) {
                setErrorMessage('Something went wrong');
                setShowErrorModal(true);
                setImageUploadStatus('Select recipe image to upload');
            }
        }
    };

    const handleCreateRecipe = async (e) => {
        e.preventDefault();
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

            const data = await response.json();

            if (response.ok) {
                setSnackbarMessage(data.message);
                setSnackbarVisible(true);
                setTimeout(() => {
                    onClose();
                }, 3000);
            } else if (data.message) {
                setErrorMessage(data.message);
                setShowErrorModal(true);
            }
        } catch (error) {
            setErrorMessage('Something went wrong');
            setShowErrorModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = title && ingredients && steps && imageUrl && preparationTime && cookingTime;

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div>
                    <h2 className={styles.modalTitle}>Create Recipe</h2>
                    <hr className={styles.divider} />
                </div>
                <form className={styles.recipeForm} onSubmit={handleCreateRecipe}>
                    <div className={styles.formContainer}>
                        <div className={styles.formFields}>
                            {/* Title Input Field */}
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputField}>
                                    <label className={styles['visually-hidden']} htmlFor='recipe-title'>Enter recipe title</label>
                                    <Tooltip label="Field is required" isOpen={isTitleFocused && !title}>
                                        <input
                                            type='text'
                                            id='recipe-title'
                                            className={styles.textInput}
                                            placeholder='Enter recipe title'
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            onFocus={() => setIsTitleFocused(true)}
                                            onBlur={() => {
                                                setIsTitleFocused(false);
                                            }}
                                            aria-label='Recipe title'
                                        />
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Ingredients Input Field */}
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputField}>
                                    <label className={styles['visually-hidden']} htmlFor='recipe-ingredients'>List ingredients</label>
                                    <Tooltip label="Field is required" isOpen={isIngredientsFocused && !ingredients}>
                                        <textarea
                                            id='recipe-ingredients'
                                            className={styles.textareaInput}
                                            placeholder='List ingredients (comma separated)'
                                            value={ingredients}
                                            onChange={(e) => setIngredients(e.target.value)}
                                            onFocus={() => setIsIngredientsFocused(true)}
                                            onBlur={() => setIsIngredientsFocused(false)}
                                            aria-label='Recipe ingredients'
                                        />
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Steps Input Field */}
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputField}>
                                    <label className={styles['visually-hidden']} htmlFor='recipe-steps'>Describe the steps</label>
                                    <Tooltip label="Field is required" isOpen={isStepsFocused && !steps}>
                                        <textarea
                                            id='recipe-steps'
                                            className={styles.textareaInput}
                                            placeholder='Describe the steps (comma separated)'
                                            value={steps}
                                            onChange={(e) => setSteps(e.target.value)}
                                            onFocus={() => setIsStepsFocused(true)}
                                            onBlur={() => setIsStepsFocused(false)}
                                            aria-label='Recipe steps'
                                        />
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Description Input Field */}
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputField}>
                                    <label className={styles['visually-hidden']} htmlFor='recipe-description'>Enter recipe description</label>
                                    <textarea
                                        id='recipe-description'
                                        className={styles.textareaInput}
                                        placeholder='Enter recipe description'
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        aria-label='Recipe description'
                                    />
                                </div>
                            </div>

                            {/* Image Upload Field */}
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputField}>
                                    <div className={styles.imageUploadWrapper}>
                                        <label htmlFor='recipe-image' className={styles.imageUploadText}>{imageUploadStatus}</label>
                                        <div className={styles.imageUploadButton}>
                                            <input
                                                id='recipe-image'
                                                type='file'
                                                accept='image/*'
                                                onChange={handleImageChange}
                                                onFocus={() => setIsImageFocused(true)}
                                                onBlur={() => setIsImageFocused(false)}
                                                aria-label='Upload recipe image'
                                            />
                                        </div>
                                    </div>
                                    <Tooltip label="Field is required" isOpen={isImageFocused && !imageUrl}>
                                        <span className={styles['visually-hidden']}>{'Field is required'}</span>
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Preparation Time Input Field */}
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputField}>
                                    <label className={styles['visually-hidden']} htmlFor='recipe-preparation-time'>Preparation time</label>
                                    <Tooltip label="Field is required" isOpen={isPreparationTimeFocused && !preparationTime}>
                                        <input
                                            type='text'
                                            id='recipe-preparation-time'
                                            className={styles.textInput}
                                            placeholder='Preparation time (e.g., 30 minutes)'
                                            value={preparationTime}
                                            onChange={(e) => setPreparationTime(e.target.value)}
                                            onFocus={() => setIsPreparationTimeFocused(true)}
                                            onBlur={() => setIsPreparationTimeFocused(false)}
                                            aria-label='Recipe preparation time'
                                        />
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Cooking Time Input Field */}
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputField}>
                                    <label className={styles['visually-hidden']} htmlFor='recipe-cooking-time'>Cooking time</label>
                                    <Tooltip label="Field is required" isOpen={isCookingTimeFocused && !cookingTime}>
                                        <input
                                            type='text'
                                            id='recipe-cooking-time'
                                            className={styles.textInput}
                                            placeholder='Cooking time (e.g., 45 minutes)'
                                            value={cookingTime}
                                            onChange={(e) => setCookingTime(e.target.value)}
                                            onFocus={() => setIsCookingTimeFocused(true)}
                                            onBlur={() => setIsCookingTimeFocused(false)}
                                            aria-label='Recipe cooking time'
                                        />
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className={styles.submitButton}>
                            <Button
                                type='submit'
                                disabled={isSubmitting || !isFormValid} // Disable button if form is not valid or is submitting
                            >
                                {isSubmitting ? 'Creating...' : 'Create Recipe'}
                            </Button>
                        </div>
                    </div>
                </form>
                <ErrorModal
                    isOpen={showErrorModal}
                    message={errorMessage}
                    onClose={() => setShowErrorModal(false)}
                />
                <Snackbar
                    isVisible={snackbarVisible}
                    message={snackbarMessage}
                    onClose={() => setSnackbarVisible(false)}
                />
            </div>
        </div>
    );
};

export default CreateRecipeModal;
