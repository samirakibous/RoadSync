import jwt from 'jsonwebtoken';

const JWT_SECRET= process.env.JWT_SECRET;
 export const isAuthenticated =(req,res,next)=>{
     try{
        const AuthHeader = req.headers.authorization;
     if(!AuthHeader ||!AuthHeader.startsWith('Bearer ')){
         return res.status(401).json({message:"Unauthorized"});
     }

     const token = AuthHeader.split(' ')[1];
     const decoded= jwt.verify(token,JWT_SECRET);
     req.user = decoded;

     next();

    } catch (err) {
    console.error(err); 
    return res.status(401).json({ message: "Token invalide ou expired" });
  }
 }