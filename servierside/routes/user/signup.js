import { validateDetails } from '../../common/commonFunctions.js';
import userModel from '../../models/user.js';
import { checkRequiredFields, hashPassword, isValidRequest } from '../../validation/validation.js';
import constant from '../../utils/constant.js';

export const signupUser = async (req, res) => {
    try {
        const body = req.body;

        if (!isValidRequest(body)) {
            return res.status(400).send({ status: false, message: constant.user.validationError.missingFields });
        }

        const requiredFields = checkRequiredFields(['name', 'email', 'password'], body);
        if (requiredFields !== true) {
            return res.status(400).send({ status: false, message: constant.general.requiredField(requiredFields) });
        }

        const validationErrors = validateDetails(body);
        if (validationErrors) {
            return res.status(400).send({ status: false, message: validationErrors });
        }

        const isExistEmail = await userModel.findOne({ email: body.email });
        if (isExistEmail) {
            return res.status(400).send({ status: false, message: constant.user.emailAlreadyExists });
        }

        body.password = await hashPassword(body.password);

        await userModel.create(body);

        return res.status(200).send({ status: true, message: constant.user.userCreationSuccess });
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};
