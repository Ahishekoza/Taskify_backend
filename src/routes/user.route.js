import express from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
const userRoute = express.Router()


// POST :--- register User----
userRoute.post('/register',registerUser)

// POST :--- Login 
userRoute.post('/login', loginUser)

// VERIFY THE TOKEN 
userRoute.get('/token', verifyToken,(req,res)=>{
    try {
        res.status(200).send("Token Valid")
    } catch (error) {
        res.status(404).send("Token expired")
    }
})



export {userRoute}