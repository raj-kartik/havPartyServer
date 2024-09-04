import mongoose from "mongoose";
const {Schema} = mongoose;

const ClubSchema = new Schema({
    name:{
        type:String,
        require:true
    },
    location:{
        require:true,
        type:String
    },
    city:{
        require:true,
        type:String
    },
    state:{
        require:true,
        type:String
    },
    pincode:{
        type:Number,
        require:true
    }
})
// hello i am in master
