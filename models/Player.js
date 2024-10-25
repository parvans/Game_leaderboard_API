import mongoose from 'mongoose';

const Player= mongoose.model(
    'Player',
    new mongoose.Schema({
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique: true
        },
        password:{
            type:String,
            required:true
        },
        isAdmin:{
            type:Boolean,
            default:false
        },
        score:{
            type:Number,
            default:0
        }
    },
    {
        timestamps:true
    })
)

export default Player;