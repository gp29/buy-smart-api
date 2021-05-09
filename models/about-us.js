var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');

var aboutSchema = new Schema({
    about_id: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    paragraph1: {
        type: String,
        default: ''
    },
    paragraph2: {
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
aboutSchema.pre('save', function(callback) {
    idGenerator.generateId('about_us', 'about_id', 'ABO', (err, ID) => {
        this.about_id = ID;
        callback();
    });
});

var About_us = mongoose.model('About_us', aboutSchema);
module.exports = About_us;