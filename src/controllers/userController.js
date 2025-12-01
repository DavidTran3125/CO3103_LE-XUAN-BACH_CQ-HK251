const { handleSqlError } = require('../middlewares/handleErrorSQL');
const usermodel= require('../models/userModel')

exports.get_profile = async (req,res)=>{
    try {

        const id=parseInt(req.params.id,10);
        if (isNaN(id)) return res.status(400).json({status:"fail", message: 'Invalid id' });
        const result= await usermodel.get_profile(id);
        if(!result) return res.status(404).json({status:"fail",message:'User not found'});

        // const strengths= await usermodel.get_strengths(id);
        // result.strengths = strengths.length ===0 ? []: strengths.map(s => s.Strength);
        // result.strengths =  strengths.map(s => s.Strength);


        // const weakness= await usermodel.get_weakness(id);
        // result.weakness = weakness.length ===0 ? []: weakness.map(s => s.Weakness);
        // result.weakness = weakness.map(s => s.Weakness);


        res.json({
            status:"success",
            data:{
                userID:result.User_ID,
                username:result.Username,
                about:result.Bio || "",
                createdAt:result.Created_at.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
            }
        })
    } catch (err) {
        handleSqlError(err,res);
    }
}

exports.update_user_bio = async (req,res)=>{
    try {
        const id= req.user.id;
        const bio= req.body.about;
        await usermodel.update_profile_DB(id,bio);
        // const user_profile= await usermodel.get_profile(id);
        res.json({
            status:"success",
            message:'update success',
            // Bio:user_profile.Bio
        })
    } catch (err) {
        handleSqlError(err,res);
    }
}

// exports.delete_user_bio = async (req,res)=>{
//     try {
//         const id= req.user.id;
//         await usermodel.update_profile_DB(id);
//         res.json({
//             message:'delete success',
//             Bio:null
//         })
//     } catch (err) {
//         handleSqlError(err,res);
//     }
// }

exports.getList_strength =async (req,res)=>{
    try {
        const id=parseInt(req.params.id,10);
        const strengths= await usermodel.get_strengths(id);      
        res.json({
            strengths:strengths.map(s => s.Strength)
        })
    } catch (err) {
        handleSqlError(err,res);
    }
}

exports.add_strength = async (req,res)=>{
    try {
        const id= req.user.id;
        const strengths= req.body.strengths

        if (strengths.length === 0) return res.status(404).json({message:"ko them gi"});

        await usermodel.add_strength_DB(id,strengths);
        // const result=await usermodel.get_strengths(id);
        res.json({
            status:"success",
            message:"success"
            // strengths: result.map(s => s.Strength)
        });
    } catch (err) {
        handleSqlError(err,res);
    }
}

exports.delete_strength = async (req,res)=>{
    try {
        const id= req.user.id;
        const strength= req.params.strength
        // console.log(strength)
        if(strength===null) res.status(401).json({message:"ko co gi xoa"})

        await usermodel.delete_strength_DB(id,strength);
        // const result=await usermodel.get_strengths(id);
        res.json({
            status:"success",
            message:"success"
            // strengths: result.map(s => s.Strength)
        });
    } catch (err) {
        handleSqlError(err,res);
    }
}


exports.getList_weakness =async (req,res)=>{
    try {
        const id=parseInt(req.params.id,10);
        const weaknesses= await usermodel.get_weakness(id);      
        res.json({
            weaknesses:weaknesses.map(s => s.Weakness)
        })
    } catch (err) {
        handleSqlError(err,res);
    }
}


exports.add_weakness = async (req,res)=>{
    try {
        const id= req.user.id;
        const weaknesses= req.body.weaknesses

        if (weaknesses.length === 0) return res.status(404).json({message:"ko them gi"});

        await usermodel.add_weakness_DB(id,weaknesses);
        // const result=await usermodel.get_weakness(id);
        res.json({
            status:"success",
            message:"success"
            // weaknesses: result.map(s => s.Weakness)
        });
    } catch (err) {
        handleSqlError(err,res);
    }
}

exports.delete_weakness = async (req,res)=>{
    try {
        const id= req.user.id;
        const weakness= req.params.weakness

        if(weakness===null) res.status(401).json({message:"ko co gi xoa"})

        await usermodel.delete_weakness_DB(id,weakness);
        // const result=await usermodel.get_weakness(id);
        res.json({
            status:"success",
            message:"success"
            // weaknesses: result.map(s => s.Weakness)
        });
    } catch (err) {
        handleSqlError(err,res);
    }
}