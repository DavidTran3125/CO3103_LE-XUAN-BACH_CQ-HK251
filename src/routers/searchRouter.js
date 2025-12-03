const searchcontroller = require('../controllers/searchController')
const {verify_token} = require('../middlewares/authMiddleware')

module.exports = (app) =>{
    app.get('/matching', verify_token,searchcontroller.search)
}