const usercontroller=require('../controllers/userController')
const {verify_token}= require('../middlewares/authMiddleware')
module.exports = (app)=>{
    
    app.get('/users/:id',verify_token,usercontroller.get_profile);
    app.put('/users/:id',verify_token,usercontroller.update_user_bio);
    // app.delete('/user/profile/delete_bio',verify_token,usercontroller.delete_user_bio);
    app.get('/users/:id/strengths',verify_token,usercontroller.getList_strength);
    app.get('/users/:id/weaknesses',verify_token,usercontroller.getList_weakness);
    app.post('/users/:id/strengths',verify_token,usercontroller.add_strength);
    app.post('/users/:id/weaknesses',verify_token,usercontroller.add_weakness);
    app.delete('/users/:id/strengths/:strength',verify_token,usercontroller.delete_strength);
    app.delete('/users/:id/weaknesses/:weakness',verify_token,usercontroller.delete_weakness);
    
}