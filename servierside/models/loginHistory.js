import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        maxlength: 5,
    },
    loggedOutAt: {
        type: Date,
        default: null
    },
    loggedInAt: {
        type: Date
    },
}, { collection: 'loginHistory', timestamps: true });

const loginHistoryModel = mongoose.model('LoginHistory', loginHistorySchema);

export default loginHistoryModel;
