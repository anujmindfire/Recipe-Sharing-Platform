import express from 'express';
import { getUserInfo, createToken } from './signin.js';
import { logout } from './logout.js';
import { verifyToken } from './verifyToken.js';
import { refreshAccessToken } from './refreshToken.js'
const apiRoutes = express.Router();

// This is the route for login and logout.

apiRoutes.post('/auth/signin', getUserInfo, createToken);
apiRoutes.post('/auth/logout', verifyToken, logout);
apiRoutes.post('/auth/refreshtoken', refreshAccessToken);

export default apiRoutes;
