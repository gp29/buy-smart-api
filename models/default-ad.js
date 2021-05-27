var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');

var defaultadSchema = new Schema({
    default_ad_id: {
        type: String,
        default: ''
    },
    category_id: {
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
defaultadSchema.pre('save', function(callback) {
    idGenerator.generateId('default_ads', 'default_ad_id', 'AD', (err, ID) => {
        this.default_ad_id = ID;
        callback();
    });
});


var Default_ad = mongoose.model('Default_ad', defaultadSchema);
module.exports = Default_ad;