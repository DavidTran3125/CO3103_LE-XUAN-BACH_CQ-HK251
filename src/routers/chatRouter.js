const chatcontroller= require('../controllers/chatController')
const {verify_token}= require('../middlewares/authMiddleware')

module.exports = (app) =>{
    app.get('/groups/:groupID/messages/:page',verify_token,chatcontroller.get_list_message);
}