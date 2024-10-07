import express from 'express';
import { sendEmailForForgotPassword } from './create.js';
import { passwordVerify } from './verify.js';
const apiRoutes = express.Router();

// this is the route for send Email for Forgot Password or Verify Forgot Password.

apiRoutes.post('/password/sendEmail', sendEmailForForgotPassword);
apiRoutes.post('/password/verify', passwordVerify);

export default apiRoutes;
