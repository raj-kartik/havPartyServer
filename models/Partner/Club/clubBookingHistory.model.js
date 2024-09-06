import mongoose from "mongoose";

const bookingHistorySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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

const ClubBookingHistory = mongoose.model('ClubBookingHistory', bookingHistorySchema);

export default ClubBookingHistory;