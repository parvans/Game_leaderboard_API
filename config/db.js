import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

export const connectDB=async()=>{
    try {
        const connect=await mongoose.connect(`mongodb+srv://parvansajeevan:${process.env.MONGOPASS}@gameleaderboard.kov6t.mongodb.net/?retryWrites=true&w=majority&appName=gameleaderboard`)
        console.log(`MongoDB Database is Connected`);

    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}
