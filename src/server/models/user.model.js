var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    firstName: String,
    lastName: String,
    token: String,
});

var Users = mongoose.model('Users', userSchema);

module.exports = Users;