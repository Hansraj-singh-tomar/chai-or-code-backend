import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';


const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// to handle json data
app.use(express.json({ limit: "16kb" }))

// to handle url data
// extended - means ham object ke andar bhi object de sakte hai
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

// to store data 
app.use(express.static("public"))

// cookie-parser => mere server se jo mere user ka browser hai uske andar ki cookie ko access kar pau or uski cookie set bhi kar pau
app.use(cookieParser());

export { app }