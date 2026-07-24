const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn:'30d',
    });
}

const registerUser = async (req, res) => {
    try{
        const {username, email, password} = req.body;

        if(!username || !email || !password){
            return res.status(400).json({message:"Please fill in all fields"});
        }
        const userExists = await User.findOne({email:email});
        if(userExists){
            return res.status(400).json({message: "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = await User.create({
            username,
            email,
            password:hashedPassword
        });

        res.status(201).json({
            _id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            message: "User registered successfully!"

        });
    }
    catch(error){
        res.status(500).json({message:"Server Error", error: error.message});
    }
};

const loginUser = async (req,res) =>{
    try{
        const{email, password} = req.body;
        const user = await User.findOne({email});

        if(user && (await bcrypt.compare(password, user.password))){
            res.status(200).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        } else{
            res.status(401).json({message: "Invalid email or password"});
        }
    } catch(error){
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
}

const getUserProfile = async (req, res)=>{
    res.status(200).json(req.user);
}

const updateUserProfile = async (req, res) => {
    try{
        const user = await User.findById(req.user._id);

        if(user){
            user.codeforcesHandle = req.body.codeforcesHandle || user.codeforcesHandle;
            user.leetcodeHandle = req.body.leetcodeHandle || user.leetcodeHandle;

            const updatedUser = await user.save();

            res.status(200).json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                codeforcesHandle: updatedUser.codeforcesHandle,
                leetcodeHandle: updatedUser.leetcodeHandle
            });
        }else{
            res.status(404).json({message: 'User not found'});
        }
    }catch(error){
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

module.exports = {registerUser, loginUser, getUserProfile, updateUserProfile};