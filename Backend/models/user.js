// in this file we write how user inputs look like or user schema look like (from servers)

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    skills: {
        type: [String],
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
