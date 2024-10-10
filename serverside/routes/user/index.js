import express from 'express';
import { signupUser } from './signup.js';
import { verifyToken } from '../auth/verifyToken.js';
import { getUser } from './get.js';
import { followUser } from './follow.js'
import { updateUser } from './update.js'
const apiRoutes = express.Router();

// This is the route for User Register and Details.

apiRoutes.post('/user', signupUser);
apiRoutes.get('/user', verifyToken, getUser);
apiRoutes.post('/follow', verifyToken, followUser)
apiRoutes.put('/update', verifyToken, updateUser);

export default apiRoutes;