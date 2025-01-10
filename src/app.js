import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGN,// manage ap ka Url kha sa ha rha ha
    credentials: true 
})) // Used in middleware or configration

app.use(express.json({
    limit: "16kb"
}))
app.use(express.urlencoded({extended: true,limit: "16kb"})) // URL data handle

app.use(express.static("public"))  //sometime store file folder create public assit

app.use(cookieParser()); // Server sa user ka browser ki cookies access and set kar skta ha 

// Routes import 

import userRouter from './routes/user.route.js'


// Routes declaration
app.use("/api/v1/users",userRouter)

export { app }