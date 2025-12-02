const {handleSqlError} = require('../middlewares/handleErrorSQL')
const groupmodel= require('../models/groupModel')

exports.create_group = async (req,res) =>{
    const id = req.user.id;
    const input = req.body;
    input.created_id=id;
    // console.log(input)
    try {
        await groupmodel.add_db_grouplearning(input);
        res.json({
            status: "success",
            message: "tạo chat area  thành công"
        })
    } catch (err) {
        handleSqlError(err,res);
    }
}