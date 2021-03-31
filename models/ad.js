var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');

var adSchema = new Schema({
    ad_id: {
        type: String,
        default: ''
    },
    Index: {
        type: Number,
        default: 0
    },
    Product_key: {
        type: String,
        default: ''
    },
    Product_Url: {
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
adSchema.pre('save', function(callback) {
    idGenerator.generateId('ads', 'ad_id', 'AD', (err, ID) => {
        this.ad_id = ID;
        callback();
    });
});


var Ad = mongoose.model('Ad', adSchema);
module.exports = Ad;