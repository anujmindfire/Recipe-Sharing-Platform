import recipeModel from '../../models/recipe.js';
import userModel from '../../models/user.js';
import constant from '../../utils/constant.js';
import { globalPagination, globalFilter, globalSearch } from '../../common/commonFunctions.js';
import moment from 'moment';

export const favoritesRecipe = async (req, res) => {
    try {
        const { limit, skip } = globalPagination(req);
        const filterConditions = await globalFilter(req);
        const searchConditions = globalSearch(req.query.searchKey, recipeModel);
        const conditions = { ...searchConditions, ...filterConditions };

        const user = await userModel.findById(req.user.userId).select('savedRecipes');

        if (!user) {
            return res.status(404).send({ status: false, message: constant.user.validationError.userNotFound });
        }

        if (user.savedRecipes.length === 0) {
            return res.status(200).send({ status: true, message: constant.recipe.recipeNotFound, data: [] });
        }

        const totalRecipes = user.savedRecipes.length;

        const data = await recipeModel
            .find({ _id: { $in: user.savedRecipes }, ...conditions })
            .limit(limit)
            .skip(skip)
            .sort({ title: 1 });

        return res.status(200).send({
            timestamp: moment().unix(),
            message: data.length > 0 ? constant.general.fetchData : constant.general.notFoundData,
            success: true,
            total: totalRecipes,
            data: data
        });
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};
