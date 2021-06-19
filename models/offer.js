var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');

var offerSchema = new Schema({
    offer_id: {
        type: String,
        default: ''
    },
    target_url: {
        type: String,
        default: ''
    },
    host: {
        type: String,
        default: ''
    },
    banner: {
        type: String,
        default: ''
    },
    short_desc: {
        type: String,
        default: ''
    },
    long_desc: {
        type: String,
        default: ''
    },
    discount: {
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
offerSchema.pre('save', function(callback) {
    idGenerator.generateId('offers', 'offer_id', 'OFF', (err, ID) => {
        this.offer_id = ID;
        callback();
    });
});

var Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;