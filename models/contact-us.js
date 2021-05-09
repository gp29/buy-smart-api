var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');

var contactUsSchema = new Schema({
    contact_id: {
        type: String,
        default: ''
    },
    user_id: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        default: ''
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
contactUsSchema.pre('save', function(callback) {
    idGenerator.generateId('contact_us', 'contact_id', 'CON', (err, ID) => {
        this.contact_id = ID;
        callback();
    });
});

var Contact_us = mongoose.model('Contact_us', contactUsSchema);
module.exports = Contact_us;