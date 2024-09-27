import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        trim: true,
    },
    savedRecipes: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Recipe',
    }],
}, { collection: 'user', timestamps: true });

const createUserModel = () => mongoose.model('User', userSchema);

export default createUserModel;
