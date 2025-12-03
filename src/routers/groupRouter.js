const groupcontroller = require('../controllers/groupController')
const {verify_token} =require('../middlewares/authMiddleware')

module.exports = (app) =>{
    app.post('/groups', verify_token,groupcontroller.create_group);
    app.get('/groups', verify_token,groupcontroller.get_list_group);
    app.get('/groups/:groupId', verify_token, groupcontroller.get_group_detail);
    app.post('/groups/:groupId/invite', verify_token, groupcontroller.invite_member);
    app.delete('/groups/:groupId/members/:userId', verify_token, groupcontroller.remove_member);
    app.post('/groups/:groupId/leave', verify_token, groupcontroller.leave_group);
}