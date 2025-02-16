const express = require('express');
const { registerUser, authUser, allusers } = require('../controllers/userControles');
const { protect } = require('../middleware/authMiddleware');

const Router = express.Router();

// Router.route('/').get((req,res)=>{
//     res.send(`working path: [${req.baseUrl}] is Active`)
// })


//                                       protect is a middleware
Router.route('/').post(registerUser).get(protect,allusers)
Router.post('/login', authUser)

// normal way
// Router.route('/').get(allusers)

module.exports = Router