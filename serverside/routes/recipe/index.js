import express from 'express';
import { verifyToken } from '../auth/verifyToken.js';
import { createRecipe } from './create.js';
import { getRecipe } from './get.js';
import { shareRecipe } from './share.js';
import { favoritesRecipe } from './favorites.js'
const apiRoutes = express.Router();

// This is the route for Recipe.

apiRoutes.post('/recipe', verifyToken, createRecipe);
apiRoutes.get('/recipe', verifyToken, getRecipe);
apiRoutes.post('/share', verifyToken, shareRecipe);
apiRoutes.get('/favorites', verifyToken, favoritesRecipe)

export default apiRoutes;
