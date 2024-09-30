import jwt from 'jsonwebtoken';
import userModel from '../../models/user.js';
import loginHistoryModel from '../../models/loginHistory.js';
import constant from '../../utils/constant.js';

export const verifyToken = async (req, res, next) => {
    const accessToken = req.headers['accesstoken'];
    const refreshToken = req.headers['refreshtoken'];

    // If neither token is provided, return an error
    if (!accessToken && !refreshToken) {
        return res.status(401).send({ status: false, message: constant.auth.accessDenied });
    }

    try {
        // First, try to verify the access token
        const decoded = jwt.verify(accessToken, process.env.SUPERSECRET);

        // Check user and session validity
        const user = await userModel.findOne({ _id: decoded.userId });
        if (!user) {
            return res.status(403).send({ success: false, message: constant.auth.userUnauthorized });
        }

        const logData = await loginHistoryModel.findOne({ userId: decoded.userId, _id: decoded.loginId });
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
                const user = await userModel.findOne({ _id: refreshDecoded.userId });
                if (!user) {
                    return res.status(403).send({ success: false, message: constant.auth.userUnauthorized });
                }

                // Generate a new access token
                const newAccessToken = jwt.sign(
                    { userId: user._id, email: user.email, loginId: refreshDecoded.loginId },
                    process.env.SUPERSECRET,
                    { expiresIn: '1h' }
                );

                // Send the new access token in the response
                req.accessToken = newAccessToken;

                // Optionally, you can also return the user data if needed
                req.user = { userId: user._id, email: user.email, loginId: refreshDecoded.loginId };

                // Continue to the next middleware
                return next();
            } catch (refreshError) {

                // Check if req.headers.id is defined
                if (!req.headers.id) {
                    return res.status(400).send({ status: false, message: 'User ID is missing in headers.' });
                }

                const checkUserAlreadyLogout = await loginHistoryModel.findOne(
                    { userId: req.headers.id },
                    null,
                    { sort: { createdAt: -1 }, new: true }
                )

                if (checkUserAlreadyLogout.loggedOutAt) {
                    return res.status(401).send({ status: false, message: constant.auth.tokenExpired, logout: true });
                }

                // If refresh token is also expired or invalid, log out the user
                const result = await loginHistoryModel.updateOne(
                    { userId: req.headers.id },
                    { loggedOutAt: new Date() },
                    { sort: { createdAt: -1 }, new: true }
                );

                if (result && result.modifiedCount > 0) {
                    return res.status(401).send({ status: false, message: constant.auth.tokenExpired, logout: true });
                }
                return res.status(400).send({ status: false, message: constant.general.genericError });
            }
        }
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};
