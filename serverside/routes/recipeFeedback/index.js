import express from 'express';
import { verifyToken } from '../auth/verifyToken.js';
import { createOrUpdateFeedback } from './createOrupdate.js';
const apiRoutes = express.Router();

// This is the route for Recipe Feedback.

apiRoutes.post('/recipefeedback', verifyToken, createOrUpdateFeedback);

export default apiRoutes;
