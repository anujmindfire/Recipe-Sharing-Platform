import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const isValidRequest = (data) => Object.keys(data).length !== 0;

const checkRequiredFields = (requiredKeys, body) => {
    for (const key of requiredKeys) {
        if (!(key in body) || body[key] === '' || body[key] === undefined || body[key] === null) {
            return key;
        } else if (Array.isArray(body[key]) && body[key].length === 0) {
            return key;
        }
    }
    return true;
};

const isValidName = (name) => /^[a-zA-Z ,]+.*$/.test(name);

const isValidMail = (email) => /^[0-9a-zA-Z._%+-]+@gmail\.com$/.test(email);

const isValidPassword = (password) => /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,50}$/.test(password);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const hashPassword = async (password) => await bcrypt.hash(password, 10);

export {
    isValidRequest,
    isValidName,
    isValidMail,
    isValidPassword,
    isValidId,
    hashPassword,
    checkRequiredFields
};
