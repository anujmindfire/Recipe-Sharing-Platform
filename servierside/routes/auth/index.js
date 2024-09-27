import express from 'express';
import { getUserInfo, createToken } from './signin.js';
import { logout } from './logout.js';
import { verifyToken } from './verifyToken.js';

const apiRoutes = express.Router();

// This is the route for login and logout.

apiRoutes.post('/auth/signin', getUserInfo, createToken);
apiRoutes.post('/auth/logout', verifyToken, logout);

export default apiRoutes;
