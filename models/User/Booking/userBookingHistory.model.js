import mongoose from "mongoose";

const bookingHistorySchema = mongoose.Schema({
    clubName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: true
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: Date,
        required: true
    },
    numberOfPeople: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const UserBookingHistory = mongoose.model('UserBookingHistory', bookingHistorySchema);

export default UserBookingHistory;