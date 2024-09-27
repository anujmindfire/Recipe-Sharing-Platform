import express from 'express';
import { signupUser } from '../user/signup.js';
const apiRoutes = express.Router();

// This is the route for User Register and Details.

apiRoutes.post('/user', signupUser);

export default apiRoutes;
