import { globalFilter, globalPagination, globalSearch } from '../../common/commonFunctions.js';
import userModel from '../../models/user.js';
import constant from '../../utils/constant.js';
import moment from 'moment';

export const getUser = async (req, res) => {
    try {
        const filterConditions = await globalFilter(req);
        const { limit, skip } = globalPagination(req);
        const searchConditions = globalSearch(req.query.searchKey, userModel);
        const conditions = { ...searchConditions, ...filterConditions, verified: true };

        if (req.query.recipeId) {
            try {
                const query = req.query;

                let updateQuery;
                
                if (query.add === 'true') {
                    updateQuery = { $addToSet: { savedRecipes: query?.recipeId } };
                } else if (query.add === 'false') {
                    updateQuery = { $pull: { savedRecipes: query?.recipeId } };
                }

                await userModel.findByIdAndUpdate(req.user.userId, updateQuery);
                return res.status(200).send({
                    status: true,
                    message: query.add === 'true' ? constant.user.recipe.recipeSaved : constant.user.recipe.recipeUnSaved,
                });
            } catch (error) {
                return res.status(400).send({ status: false, message: constant.general.genericError });
            }
        }

        if (req.query._id) {
            try {
                const userData = await userModel.findById(req.user.id);
                return res.status(200).send({ status: true, message: constant.general.fetchData, data: userData });
            } catch (error) {
                return res.status(400).send({ status: false, message: constant.general.genericError });
            }
        }

        const loggedInUser = await userModel.findById(req.user.userId); 
        const followingIds = loggedInUser.following.map(user => user._id);
        const follwerIds = loggedInUser.followers.map(user => user._id)

        if (req.query.allUser) {
            conditions._id = { $nin: [req.user.userId] }; 
        }

        if (req.query.following) {
            conditions._id = { $in: followingIds }; 
        }

        if (req.query.follower) {
            conditions._id = { $in: follwerIds };
        }

        const count = await userModel.countDocuments(conditions);
        const data = await userModel.find(conditions)
            .skip(skip)
            .limit(limit)
            .sort({ id: 1 });

        return res.status(200).send({
            timestamp: moment().unix(),
            message: data.length > 0 ? constant.general.fetchData : constant.general.notFoundData,
            success: true,
            total: count,
            data: data
        });
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};
