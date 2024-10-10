import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@chakra-ui/react';
import styles from '../styles/form.module.css';
import Button from './Button';
import Loader from './Loader';
import ErrorModal from './ErrorModal';
import Snackbar from './Snackbar';
import { backendURL } from '../api/url';
import { refreshAccessToken } from '../utils/tokenServices';
import DOMPurify from 'dompurify';
import InputField from './InputField';

const ProfileForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        bio: '',
        favouriteRecipe: '',
        state: '',
        city: '',
        isLoading: false,
        errorMessage: '',
        showErrorModal: false,
        notFound: false,
        errors: {
            name: '',
            password: '',
            confirmPassword: '',
        },
    });

    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showNameHelp, setShowNameHelp] = useState(false);
    const [showPasswordHelp, setShowPasswordHelp] = useState(false);
    const [userStateFetched, setUserStateFetched] = useState(false); 
    const { isLoading, errorMessage, showErrorModal, notFound } = formData;

    const accesstoken = localStorage.getItem('accesstoken');
    const refreshtoken = localStorage.getItem('refreshtoken');
    const userId = localStorage.getItem('id');
    const navigate = useNavigate();

    const handleFetchError = useCallback((data, response) => {
        if (response.status === 401 || data.unauthorized) {
            return refreshAccessToken(refreshtoken, userId, navigate);
        } else if (data.message) {
            setFormData((prev) => ({ ...prev, errorMessage: data.message, showErrorModal: true }));
        }
    }, [refreshtoken, userId, navigate]);

    const fetchUser = useCallback(async () => {
        setFormData((prevState) => ({ ...prevState, isLoading: true, showErrorModal: false }));
        try {
            const response = await fetch(`${backendURL}/user?_id=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    accesstoken,
                    id: userId,
                },
            });

            const data = await response.json();

            if (response.ok) {
                const { state: userState, name, email, bio, favouriteRecipe, city } = data.data;
                setFormData((prev) => ({
                    ...prev,
                    name,
                    email,
                    bio,
                    favouriteRecipe,
                    state: userState,
                    city,
                }));
                setUserStateFetched(true); 
            } else {
                handleFetchError(data, response);
            }
        } catch (error) {
            setFormData((prev) => ({ ...prev, errorMessage: 'Something went wrong.', showErrorModal: true }));
        } finally {
            setFormData((prev) => ({ ...prev, isLoading: false }));
        }
    }, [accesstoken, handleFetchError, userId]);

    const fetchStates = useCallback(async () => {
        setFormData((prev) => ({ ...prev, isLoading: true }));
        try {
            const response = await fetch(`${backendURL}/states`);
            const data = await response.json();
            if (response.ok) {
                setStates(data.states);
                return data.states;
            }
        } catch (error) {
            setFormData((prev) => ({ ...prev, errorMessage: 'Something went wrong.', showErrorModal: true }));
        } finally {
            setFormData((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    const fetchCities = useCallback(async (stateId) => {
        setFormData((prev) => ({ ...prev, isLoading: true }));
        try {
            const response = await fetch(`${backendURL}/city/${stateId}`);
            const data = await response.json();
            if (response.ok) {
                setCities(data.districts);
            }
        } catch (error) {
            setFormData((prev) => ({ ...prev, errorMessage: 'Something went wrong.', showErrorModal: true }));
        } finally {
            setFormData((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            await fetchStates();
            await fetchUser();
        };
    
        loadData();
    }, [fetchUser, fetchStates]);
    
    useEffect(() => {
        const fetchCityData = async () => {
            if (userStateFetched && states.length > 0) {
                const userState = formData.state;
                const selectedState = states.find(state => state.state_name === userState);
                if (selectedState) {
                    await fetchCities(selectedState.state_id);
                }
            }
        };
    
        fetchCityData();
    }, [userStateFetched, states, formData.state, fetchCities]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const sanitizedValue = DOMPurify.sanitize(value);
        const error = validateField(name, sanitizedValue, formData);

        setFormData((prev) => ({
            ...prev,
            [name]: sanitizedValue,
            errors: {
                ...prev.errors,
                [name]: error,
            },
            errorMessage: error,
        }));

        if (name === 'state') {
            const selectedState = states.find(state => state.state_name === sanitizedValue);
            if (selectedState) {
                fetchCities(selectedState.state_id);
            }
        }
    };

    const validateField = (name, value, formData) => {
        switch (name) {
            case 'name':
                if (!/^[A-Za-z\s]+$/.test(value)) return 'Name can only contain letters and spaces.';
                if (value.length < 2 || value.length > 50) return 'Name should be greater than 2 and less than 50 characters.';
                return '';
            case 'password':
                if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,50}$/.test(value)) {
                    return 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.';
                }
                return '';
            case 'confirmPassword':
                return value !== formData.password ? 'Passwords do not match.' : '';
            default:
                return '';
        }
    };

    const validateForm = useCallback(() => {
        const { name, password, confirmPassword } = formData;

        const isNameValid = name.length >= 2 && name.length <= 50 && /^[A-Za-z\s]+$/.test(name);

        const isPasswordValid = password === '' || (
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,50}$/.test(password) &&
            password === confirmPassword
        );

        return isNameValid && isPasswordValid;
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setFormData((prev) => ({
                ...prev,
                showErrorModal: true,
                errorMessage: 'Please correct the highlighted errors before submitting.'
            }));
            return;
        }
    
        setFormData((prev) => ({ ...prev, isLoading: true }));
    
        const payload = Object.fromEntries(
            Object.entries(formData)
                .filter(([key, value]) => value !== '' && key !== 'email')
        );
    
        try {
            const response = await fetch(`${backendURL}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    accesstoken,
                    id: userId,
                },
                body: JSON.stringify(payload),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                setSuccessMessage(data.message);
                setShowSnackbar(true);
                setTimeout(() => window.location.reload(), 1000);
            } else {
                handleFetchError(data, response);
            }
        } catch (error) {
            setFormData((prev) => ({ ...prev, errorMessage: error.message, showErrorModal: true }));
        } finally {
            setFormData((prev) => ({ ...prev, isLoading: false }));
        }
    };

    const handleErrorModalClose = () => setFormData((prev) => ({ ...prev, showErrorModal: false, errorMessage: '' }));

    return (
        <div className={`${styles.authPage}`}
            style={{ padding: '20px',  marginTop: '30px' }} >
            <main className={styles.mainContent}>
                <form className={styles.formContainer} onSubmit={handleSubmit}>
                    <Tooltip hasArrow label={showNameHelp ? formData.errors.name : ''} isOpen={!!formData.errors.name} placement='top'>
                        <InputField
                            label='Name'
                            name='name'
                            type='text'
                            value={formData.name}
                            onChange={handleChange}
                            onFocus={() => setShowNameHelp(true)}
                            onBlur={() => setShowNameHelp(false)}
                        />
                    </Tooltip>

                    <InputField
                        label='Email'
                        name='email'
                        type='email'
                        value={formData.email}
                        disabled={true}
                    />

                    <Tooltip hasArrow label={showPasswordHelp ? formData.errors.password : ''} isOpen={!!formData.errors.password} placement='top'>
                        <InputField
                            label='Password'
                            name='password'
                            type='password'
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setShowPasswordHelp(true)}
                            onBlur={() => setShowPasswordHelp(false)}
                        />
                    </Tooltip>

                    <Tooltip hasArrow label={formData.errors.confirmPassword} isOpen={!!formData.errors.confirmPassword} placement='top'>
                        <InputField
                            label='Confirm Password'
                            name='confirmPassword'
                            type='password'
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={() => setFormData((prev) => ({
                                ...prev,
                                errors: {
                                    ...prev.errors,
                                    confirmPassword: validateField('confirmPassword', formData.confirmPassword, formData)
                                }
                            }))}
                        />
                    </Tooltip>

                    <InputField
                        label='Bio'
                        name='bio'
                        type='textarea'
                        value={formData.bio}
                        onChange={handleChange}
                    />

                    <InputField
                        label='Favourite Recipe'
                        name='favouriteRecipe'
                        type='text'
                        value={formData.favouriteRecipe}
                        onChange={handleChange}
                    />

                    <InputField
                        label='State'
                        name='state'
                        type='select'
                        value={formData.state}
                        onChange={handleChange}
                        options={states.map(state => ({
                            label: state.state_name,
                            value: state.state_name,
                        }))}
                    />

                    <InputField
                        label='City'
                        name='city'
                        type='select'
                        value={formData.city}
                        onChange={handleChange}
                        options={cities.map(city => ({
                            label: city.district_name,
                            value: city.district_name,
                        }))}
                    />

                    <Button w='300px' type='submit' disabled={isLoading}>
                        {isLoading ? 'Updating...' : 'Update Profile'}
                    </Button>

                    {isLoading && !notFound && <Loader />}
                </form>
                {notFound && <p className={styles.noDataMessage}>No User found</p>}
                <Snackbar isVisible={showSnackbar} onClose={() => setShowSnackbar(false)} message={successMessage} />
                {showErrorModal && <ErrorModal message={errorMessage} onClose={handleErrorModalClose} />}
            </main>
        </div>
    );
};

export default ProfileForm;
