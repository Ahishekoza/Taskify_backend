import mongoose from 'mongoose';
import dotenv from 'dotenv';
const DB_NAME = 'Todo'
dotenv.config()

export const connectDB = async()=>{
    try {
        const connected_DB =await mongoose.connect(`${process.env.MONGO_DB_URL}/${DB_NAME}`)
        console.log(connected_DB.connection.host);
    } catch (error) {
        throw new Error("Error connecting to Mongo Server");
    }
}