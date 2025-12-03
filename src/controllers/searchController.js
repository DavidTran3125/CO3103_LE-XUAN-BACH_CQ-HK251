const searchmodel = require('../models/searchModel');
const {handleSqlError} = require('../middlewares/handleErrorSQL')

exports.search = async (req, res) =>{
    try {
        const { userid,username, strength, weak} = req.query;
        // console.log({ userid,username, strength, weak})
        const flag_strength= strength? 1:0;
        const flag_weak= weak? 1:0;
        let result;
        if(userid){
            result= await searchmodel.search_id(userid,flag_strength,flag_weak,strength,weak);
        }
        else if( username){

            result= await searchmodel.search_username(username,flag_strength,flag_weak,strength,weak)
        }
        // else if(flag_strength ||  flag_weak){
        else{
            result= await searchmodel.filter_user(flag_strength,flag_weak,strength,weak);
        }
        return res.json({
            status: "success",
            data: result
        })
    } catch (err) {
        handleSqlError(err,res);
    }
}