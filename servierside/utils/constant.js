const constant = {
    general: {
        welcome: 'Welcome peeps!',
        mongoConnectionSuccess: 'MongoDB is connected 👍 😄',
        expressAppRunning: (port) => `Express app running on port ${port}`,
        mongoConnectionError: 'MongoDB connection error:',
        notFoundError: 'Page not found.',
        genericError: 'Something went wrong',
        requiredField: (field) => `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
        fetchData: 'Fetched data',
        notFoundData: 'No data found'
    },
    user: {
        userCreationSuccess: 'User created successfully',
        emailAlreadyExists: 'Email Already Exist',
        validationError: {
            missingFields: 'Please provide Name, Email, or Password',
            invalidName: 'Name should contain only alphabets',
            nameLength: 'Name should be between 2 and 50 characters',
            invalidEmail: 'Email is invalid; only gmail.com is supported',
            invalidPassword: 'Password must be 8-50 characters long consisting of at least one number, uppercase letter, lowercase letter, and special character',
        },
    },
    feedback: {
        missingFeedbackDetails: 'Please provide Feedback details',
        invalidRatingValue: 'Rating value must be between 1 and 5.',
        recipeNotFound: 'Recipe not found',
        ownRecipeFeedbackError: 'You cannot add feedback to your own recipe',
        feedbackAlreadyExists: 'You have already added feedback for this recipe. If you wish to change your feedback, please update your existing feedback instead.',
        feedbackAddedSuccess: 'Feedback Added successfully',
        feedbackUpdatedSuccess: 'Feedback Updated successfully',
        feedbackNotFound: 'Feedback not found',
    },
    recipe: {
        missingRecipeDetails: 'Please provide recipe details',
        duplicateTitleError: 'You have already created a recipe with this title. Please choose a different title.',
        recipeCreatedSuccess: 'Recipe created successfully',
        recipeNotFound: 'Recipe not found',
    },
    s3: {
        noFileUploaded: 'No file uploaded.',
        invalidFileSize: (currentSize) => `File size must be between 20 KB and 10 MB. Current size: ${currentSize.toFixed(2)} KB`,
    },
    auth: {
        missingLoginDetails: 'Please provide login details',
        loginSuccess: 'Logged in successfully',
        logoutSuccess: 'Logout successfully',
        invalidCredential: 'Invalid Credential',
        alreadyLoggedIn: 'You are already logged in',
        tokenExpired: 'Token has expired. Please log in again.',
        accessDenied: 'Access denied. No token provided.',
        userUnauthorized: 'User Unauthorized',
        tokenUnauthorized: 'User Unauthorized Token',
        tokenExpiredError: 'TokenExpiredError'
    },
};

export default constant;
