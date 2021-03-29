var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');

var userSchema = new Schema({
    user_id: {
        type: String,
        default: ''
    },
    social_id: {
        type: String,
        default: ''
    },
    social_type: {
        type: String,
        enum:['google', 'facebook', ''],
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    mobile_country_code: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
        default: ''
    },
    profile_picture: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default:'active'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});



// // Execute before each user.save() call
userSchema.pre('save', function(callback) {
    idGenerator.generateId('users', 'user_id', 'USE', (err, ID) => {
        this.user_id = ID;
        callback();
    });
});

var User = mongoose.model('User', userSchema);
module.exports = User;