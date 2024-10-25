import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();


const verifyToken = (req,res,next)=>{
    const token=req.headers.authorization;    
    
    if(!token) return res.status(401).json({message:"Your are not authenticated!"})
    jwt.verify(token,process.env.JWT_SECRET_KEY,(err,user)=>{
        if (err) return res.status(403).json({message:"Token is not valid"})
        req.user=user;
        next()
    })
}


export default verifyToken;