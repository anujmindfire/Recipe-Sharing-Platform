import express from 'express';
import constant from '../utils/constant.js';
import user from './user/index.js';
import otp from './otp/index.js';
import forgotPassword from './forgotPassword/index.js';
import auth from './auth/index.js';
import recipe from './recipe/index.js';
import recipeFeedback from './recipeFeedback/index.js';
import getS3URL from './getS3Url/index.js';

const router = express.Router();

/****** USER ******/
router.use(user);

/****** OTP ******/
router.use(otp);

/****** FORGOT PASSWORD ******/
router.use(forgotPassword);

/****** LOGIN & LOGOUT ******/
router.use(auth);

/****** RECIPE ******/
router.use(recipe);

/****** FEEDBACK ******/
router.use(recipeFeedback);

/****** GET S3 URL ******/
router.use(getS3URL);

/****** Validating the endpoint ******/
router.all('/*', (req, res) => {
  res.status(404).send({ status: false, message: constant.general.notFoundError });
});

export default router;
