import mongoose from 'mongoose';
import bcrypt from 'bcrypt'

const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    isAdult: {
        type: Boolean,
        required: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /.+\@.+\..+/,
    },
    password: {
        type: String,
        required: true,
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    isBanned:{
        type:Boolean,
        default:false
    }
});

const User = mongoose.model('User', userSchema);
export default User;
