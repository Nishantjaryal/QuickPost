const expressAsyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const generateToken = require("../config/generateToken");
const registerUser = expressAsyncHandler(async (req,res) =>{
    const {name,email,password,pic} = req.body;

    if(!name || !email || !password){
        res.status(400);
        throw new Error("Please Enter all the Fields");
    }

    const userExists = await User.findOne({email})

    if(userExists){
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        pic,
    })

    if (user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        }) 
    } else {
        res.status(400);
        throw new Error("Failed to create new user");
    }
})


const authUser = expressAsyncHandler(async(req,res) => {
    const { email,password } = req.body;

    const userExista = await User.findOne({email});
    if (userExista && (await userExista.matchPassword(password))){
        res.json({
            _id: userExista._id,
            name: userExista.name,
            email: userExista.email,
            pic: userExista.pic,
            token: generateToken(userExista._id),
        });

    }
    else{
        res.status(401);
        throw new Error("Bad Request")
    }

})


// /api/user?search=nishant
const allusers = expressAsyncHandler(async(req,res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search , $options: "i"}},
            { email: { $regex: req.query.search , $options: "i"}},
        ]
    } : {} ;


    // except me the current user give me any matching user.
     const users = await User.find(keyword).find({_id:{$ne:req.user._id}})
     res.send(users); 

})


module.exports = { registerUser, authUser, allusers }