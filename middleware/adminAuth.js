import verifyToken from "./verifyToken.js"

const veriftyAdmin=(req,res,next)=>{
    verifyToken(req,res,()=>{
        if (req.user.isAdmin) {
            next()
        } else {
            return res.status(403).json({message:"Your are not rights do this operation"})
        }
    })
}


export default veriftyAdmin;