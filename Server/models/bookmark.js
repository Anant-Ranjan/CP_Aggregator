const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    platform: {
        type: String,
        required: true,
        enum: ['Codeforces', 'LeetCode']
    },
    problemName: {
        type: String,
        required: true,
    }, 
    problemLink:{
        type: String,
        required: true
    },
    difficulty:{
        type: String, 
        required: false
    },
    
    status:{
        type: String,
        enum: ['To Do', 'Attempted','Solved'],
        default: 'To Do'
    }
}, {timestamps: true});

module.exports = mongoose.model('Bookmark', bookmarkSchema);