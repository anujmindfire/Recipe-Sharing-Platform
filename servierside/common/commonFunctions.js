import mongoose from 'mongoose';
import { isValidMail, isValidName, isValidPassword } from '../validation/validation.js';
import moment from 'moment';
import recipeFeedbackModel from '../models/recipeFeedback.js';
import constant from '../utils/constant.js';

// ************************ Common Function *********************** //

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const generateResponseObject = (data, count) => ({
    timestamp: moment().unix(),
    message: data.length > 0 ? constant.general.fetchData : constant.general.notFoundData,
    success: true,
    total: count,
    data: data,
});

/**
 * Handles pagination for a global query.
 * It extracts limit and skip values from the request query.
 * If 'fetched' is not provided or is not set to 'all', it calculates 
 * pagination parameters based on the provided page and limit.
 * 
 * @param {Object} req - The request object containing query parameters.
 * @returns {Object} An object containing limit and skip values for pagination.
 */
const globalPagination = (req) => {
    const { fetched } = req.query;

    let limit = null;
    let skip = null;

    if (!fetched && (fetched !== 'all' && fetched !== 'All')) {
        limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        skip = (page - 1) * limit;
    }

    delete req.query.fetched;
    delete req.query.limit;
    delete req.query.page;

    return { limit, skip };
};

/**
 * Constructs a search condition based on a filter key for a given model.
 * It generates a MongoDB query that searches for documents matching the 
 * provided filter key across various attribute types (String, Number, Array).
 * 
 * @param {string} filterKey - The key used for searching within the model attributes.
 * @param {Object} modelObj - The Mongoose model object containing the schema.
 * @returns {Object} A MongoDB search condition object.
 */
const globalSearch = (filterKey, modelObj) => {
    if (!filterKey) return {};
    filterKey = (filterKey || '').replace(/\s+/g, ' ').trim();
    const searchConditions = { $or: [] };

    const processAttribute = (key, attribute) => {
        if (attribute.instance === 'String') {
            searchConditions.$or.push({ [key]: { $regex: filterKey, $options: 'i' } });
        } else if (attribute.instance === 'Number') {
            const numericFilterKey = parseFloat(filterKey);
            if (!isNaN(numericFilterKey)) {
                searchConditions.$or.push({ [key]: numericFilterKey });
            }
        } else if (attribute.instance === 'Array') {
            searchConditions.$or.push({ [key]: { $regex: filterKey, $options: 'i' } });
        }
    };

    const processModelAttributes = (modelObject) => {
        const attributes = Object.keys(modelObject.schema.paths);
        attributes.forEach((key) => {
            const attribute = modelObject.schema.paths[key];
            processAttribute(key, attribute);
        });
    };

    Object.entries(modelObj.schema.paths).forEach(([key, attribute]) => {
        processAttribute(key, attribute);
        if (attribute.options && attribute.options.ref) {
            const matchedModel = mongoose.model(attribute.options.ref);
            matchedModel && processModelAttributes(matchedModel);
        }
    });

    return searchConditions;
};

/**
 * Constructs a filter condition based on query parameters from the request.
 * It supports filtering by specific fields and handles special cases like 
 * filtering by rating value using aggregation to find recipe IDs.
 * 
 * @param {Object} req - The request object containing query parameters.
 * @returns {Promise<Object>} A promise that resolves to an object containing the filter conditions.
 */
const globalFilter = async (req) => {
    const queryKeys = ['_id', 'title', 'preparationTime', 'cookingTime'];
    const condition = queryKeys.reduce((acc, key) => {
        if (req.query[key]) {
            acc[key] = req.query[key];
        }
        return acc;
    }, {});

    // Handle the ratingValue filter
    if (req.query.ratingValue) {
        const ratingValue = parseInt(req.query.ratingValue);
        if (ratingValue >= 1 && ratingValue <= 5) {
            // Find recipes with the specified rating
            const recipesWithRating = await recipeFeedbackModel.aggregate([
                { $match: { ratingValue: ratingValue } },
                { $group: { _id: "$recipeId" } }
            ]);

            const recipeIds = recipesWithRating.map(feedback => feedback._id);
            condition._id = { $in: recipeIds };
        }
    }
    return condition;
};

const validateDetails = (body) => {
    if (!isValidName(body.name)) {
        return constant.user.validationError.invalidName;
    }
    if (body.name.length < 2 || body.name.length > 50) {
        return constant.user.validationError.nameLength;
    }
    if (!isValidMail(body.email)) {
        return constant.user.validationError.invalidEmail;
    }
    if (!isValidPassword(body.password)) {
        return constant.user.validationError.invalidPassword;
    }
    return null;
};

export {
    capitalizeFirstLetter,
    globalPagination,
    globalSearch,
    globalFilter,
    generateResponseObject,
    validateDetails,
};
