import mongoose from "mongoose";
const { Schema } = mongoose;

const ClubSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    required: true,
    type: String,
  },
  city: {
    required: true,
    type: String,
  },
  state: {
    required: true,
    type: String,
  },
  pincode: {
    type: Number,
    required: true,
  },
//   photos: [],
  offers: [
    {
      offer: {
        type: String
      },
    },
  ],
  price:[
    {
        single:{
            type:Number,
            require:true
        },
        couple:{
            type:Number,
            require:true
        },
    }
  ],
  menu:{
    drink:[],
    foods:[],
  }
});

export default mongoose.model('Club', ClubSchema);
