const usercontroller=require('../controllers/userController')
const {verify_token}= require('../middlewares/authMiddleware')
module.exports = (app)=>{
    
    app.get('/user/profile/:id',verify_token,usercontroller.get_profile);
    app.put('/user/profile/update_bio',verify_token,usercontroller.update_user_bio);
    app.delete('/user/profile/delete_bio',verify_token,usercontroller.delete_user_bio);
    app.post('/user/profile/add_strengths',verify_token,usercontroller.add_strength);
    app.post('/user/profile/add_weaknesses',verify_token,usercontroller.add_weakness);
    app.delete('/user/profile/delete_strength/:strength',verify_token,usercontroller.delete_strength);
    app.delete('/user/profile/delete_weakness/:weakness',verify_token,usercontroller.delete_weakness);
    
}