require('dotenv').config();
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
const SECRET = process.env.SECRET_KEY;

exports.verify_token = (req,res,next)=>{
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({status:"fail", message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({status:"fail", message: 'Invalid token format' });
        }

        const payload  = jwt.verify(token, SECRET);
        req.user = payload ;
        
        next(); 
    } catch (err) {
        return res.status(401).json({status:"fail", message: 'Unauthorized or token expired' });
    }
    

}