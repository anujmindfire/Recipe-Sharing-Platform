import jwt from 'jsonwebtoken';
import userModel from '../../models/user.js';
import loginHistory from '../../models/loginHistory.js';
import constant from '../../utils/constant.js';

export const verifyToken = async (req, res, next) => {
    const token = req.headers['accesstoken'];
    const refreshToken = req.headers['refreshtoken'];

    // If neither token is provided, return an error
    if (!token && !refreshToken) {
        return res.status(401).send({ status: false, message: constant.auth.accessDenied });
    }

    try {
        // First, try to verify the access token
        const decoded = jwt.verify(token, process.env.SUPERSECRET);
        
        // Check user and session validity
        const user = await userModel.findOne({ _id: decoded.id });
        if (!user) {
            return res.status(403).send({ success: false, message: constant.auth.userUnauthorized });
        }

        const logData = await loginHistory.findOne({ userId: decoded.id, _id: decoded.loginId });
        if (!logData || logData.loggedOutAt) {
            return res.status(401).send({ success: false, message: constant.auth.tokenUnauthorized });
        }

        // If access token is valid, attach user data to request
        req.user = decoded;
        return next();
    } catch (error) {
        // If access token is expired, check refresh token
        if (error.name === constant.auth.tokenExpiredError && refreshToken) {
            try {
                // Verify the refresh token
                const refreshDecoded = jwt.verify(refreshToken, process.env.REFRESHSECRET);

                // Check if user still exists
                const user = await userModel.findOne({ _id: refreshDecoded.id });
                if (!user) {
                    return res.status(403).send({ success: false, message: constant.auth.userUnauthorized });
                }

                // Generate a new access token
                const newAccessToken = jwt.sign(
                    { id: user._id, email: user.email, loginId: refreshDecoded.loginId }, 
                    process.env.SUPERSECRET, 
                    { expiresIn: '1h' }
                );

                // Send the new access token in the response
                req.token = newAccessToken;

                // Optionally, you can also return the user data if needed
                req.user = { id: user._id, email: user.email };

                // Continue to the next middleware
                return next();
            } catch (refreshError) {
                // If refresh token is also expired or invalid, log out the user
                await loginHistory.findOneAndUpdate(
                    { userId: req.body.userId || req.query.userId },
                    { loggedOutAt: new Date() },
                    { sort: { createdAt: -1 }, new: true }
                );

                return res.status(401).send({ status: false, message: constant.auth.tokenExpired, logout: true });
            }
        }
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};
