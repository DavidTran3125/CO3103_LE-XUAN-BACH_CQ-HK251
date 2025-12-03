const groupcontroller = require('../controllers/groupController')
const {verify_token} =require('../middlewares/authMiddleware')

module.exports = (app) =>{
    app.post('/groups', verify_token,groupcontroller.create_group);
    app.get('/groups', verify_token,groupcontroller.get_list_group);
}