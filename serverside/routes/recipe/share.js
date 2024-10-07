import userModel from '../../models/user.js';
import constant from '../../utils/constant.js';

export const shareRecipe = async (req, res) => {
    try {
        const body = req.body;

        const user = await userModel.findById(req.user.userId);
        if (!user) {
            return res.status(404).send({ status: false, message: 'User not found' });
        }

        const socketId = global.userSockets[body.userId];
        if (socketId) {
            const notificationMessage = `${user.name} shared a '${body.title}'`
            global.io.to(socketId).emit('notification', {
                message: notificationMessage
            });
        }

        return res.status(201).send({ status: true, message: 'Shared successfully!' });
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};
