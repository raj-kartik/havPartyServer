import mongoose from "mongoose";
const {Schema} = mongoose;

const wishListSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        require:true
    },
    favorites:[{
        type:Schema.Types.ObjectId,
        ref:'Club',
        default:[],
    }]
})

const WishList = mongoose.model('WishList', wishListSchema);
export default WishList;