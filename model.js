const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name : {
        type: String,
        maxLength: 50,
        required: true,
    },
    id : {
        type: String,
        trim: true,
        unique: 1,
        required: true,
    },
    pw : {
        type: String,
        minLength: 5,
        maxLength: 15,
        required: true,
    },
});

const User = mongoose.model("User", userSchema);

module.exports = { User };