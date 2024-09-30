import userModel from '../../models/user.js';
import loginHistoryModel from '../../models/loginHistory.js';
import { checkRequiredFields, isValidRequest } from '../../validation/validation.js';
import constant from '../../utils/constant.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const getUserInfo = async (req, res, next) => {
    try {
        const body = req.body;

        if (!isValidRequest(body)) {
            return res.status(400).send({ status: false, message: constant.auth.missingLoginDetails });
        }

        const requiredFields = checkRequiredFields(['email', 'password'], body);
        if (requiredFields !== true) {
            return res.status(400).send({ status: false, message: `${constant.general.requiredField(requiredFields)} is required` });
        }

        const userData = await userModel.findOne({ email: body.email });
        if (!userData) {
            return res.status(400).send({ status: false, message: constant.auth.invalidCredential });
        }

        const activeSession = await loginHistoryModel.findOne({
            userId: userData._id,
            loggedOutAt: null
        });

        if (activeSession) {
            return res.status(403).send({ status: false, message: constant.auth.alreadyLoggedIn });
        }

        const passwordMatch = await bcrypt.compare(body.password, userData.password);
        if (!passwordMatch) {
            return res.status(401).send({ status: false, message: constant.auth.invalidCredential });
        }

        req.data = userData;
        next();
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};

export const createToken = async (req, res) => {
    try {
        if (!req.data) return res.status(400).send({ status: false, message: constant.auth.invalidCredential });

        const rowData = req.data;

        const body = {
            userId: rowData.id,
            loggedInAt: new Date(),
            type: 'web'
        };

        const data = await loginHistoryModel.create(body);

        const tokenData = {
            userId: rowData._id,
            email: rowData.email,
            loginId: data._id
        };

        // Generate JWT token
        const token = jwt.sign(tokenData, process.env.SUPERSECRET, { expiresIn: '1h' });

        // Generate refresh token
        const refreshToken = jwt.sign(tokenData, process.env.REFRESHSECRET, { expiresIn: '7h' });

        await loginHistoryModel.updateMany(
            {
                userId: rowData._id,
                type: 'web',
                _id: { $ne: data._id }
            },
            {
                loggedOutAt: new Date()
            }
        );

        const objData = {
            userId: rowData._id,
            email: rowData.email,
            name: rowData.name
        };

        return res.status(200).send({
            success: true,
            message: constant.auth.loginSuccess,
            token,
            refreshToken,
            data: objData
        });
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};
