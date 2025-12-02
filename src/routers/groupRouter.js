const groupcontroller = require('../controllers/groupController')
const {verify_token} =require('../middlewares/authMiddleware')

module.exports = (app) =>{
    app.post('/create_group', verify_token,groupcontroller.create_group);
}