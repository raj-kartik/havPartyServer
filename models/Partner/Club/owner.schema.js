import { model, Schema } from "mongoose";

const ownerSchema = new Schema({
    name:{
        type: String,
        require:true
    },
    clubs_owned:[
        {
            type:Schema.Types.ObjectId,
            ref:'Club',
            default:[],
            underage_allowed:Boolean                     //change name of param
        }
    ]
});

const Owner =new model('Owner', ownerSchema);

export default Owner;