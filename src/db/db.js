import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        // mongodb ka url hai, jha par connction ho rha hai vo le le 
        // production ki jagah khi or connect na ho jau uss chij ko check karne ke liye ham ye kar rhe hai 
        console.log(`\n MoongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error", error);
        // jo hamari current application chal rhi hai vo ek na ek process par chal rhi hogi, or ye uska ek refrence hai   
        process.exit(1);
    }
}

export default connectDB;

// db se jab bhi baat karo tab try_catch and async_await ka use karna must hai
