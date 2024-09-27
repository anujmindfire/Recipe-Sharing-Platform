import { generateResponseObject, globalFilter, globalPagination, globalSearch } from '../../common/commonFunctions.js';
import recipeModel from '../../models/recipe.js';
import recipeFeedbackModel from '../../models/recipeFeedback.js';
import constant from '../../utils/constant.js';

export const getRecipe = async (req, res) => {
    try {
        const filterConditions = await globalFilter(req);
        const { limit, skip } = globalPagination(req);
        const searchConditions = globalSearch(req.query.searchKey, recipeModel);
        const conditions = { ...searchConditions, ...filterConditions };

        if (req.query._id) {
            // Fetch the recipe by ID
            const recipe = await recipeModel.findById(req.query._id).populate('creator', 'name');

            if (!recipe) {
                return res.status(404).json({ status: false, message: constant.recipe.recipeNotFound });
            }

            // Fetch feedback for the recipe
            const feedbackData = await recipeFeedbackModel.find({ recipeId: req.query._id }).populate('userId', 'name');

            // Combine all data into a single response object
            const responseData = {
                recipe,
                feedbackData
            };

            return res.status(200).send({ status: true, message: constant.general.fetchData, data: responseData });
        }

        const count = await recipeModel.countDocuments(conditions);
        const data = await recipeModel.find(conditions)
            .skip(skip)
            .limit(limit)
            .sort({ id: 1 });

        const response = generateResponseObject(data, count);
        return res.status(200).send(response);
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};
