import express from 'express';
import { verifyToken } from '../auth/verifyToken.js';
import { createRecipe } from './create.js';
import { getRecipe } from './get.js';
const apiRoutes = express.Router();

// This is the route for Recipe.

apiRoutes.post('/recipe', verifyToken, createRecipe);
apiRoutes.get('/recipe', verifyToken, getRecipe);

export default apiRoutes;
