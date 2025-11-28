const authcontroller= require('../controllers/authController')
const {verify_token}= require('../middlewares/authMiddleware')

module.exports = (app)=>{
    app.post('/login',authcontroller.login);
    app.post('/signup',authcontroller.signup);
    app.post('/test',verify_token,authcontroller.test);
}