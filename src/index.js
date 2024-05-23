// require('dotenv').config({path: './env'});
import dotenv from 'dotenv';
import connectDB from './db/db.js';

dotenv.config({
    path: './env'
})

connectDB();

/*
    what is dotenv npm package - As early as possible in your application, import and configure dotenv.
    require('dotenv').config()
    console.log(process.env);
*/


/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from 'express'
const app = express();
    
; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error: ", error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT} || 3000`);
        })
    } catch (error) {
        console.log("ERROR: ", error);
        throw err
    }
})()
*/