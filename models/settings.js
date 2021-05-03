var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');

var settingSchema = new Schema({
    setting_id: {
        type: String,
        default: ''
    },
    display_ad: {
        type: Number,
        default: 0
    },
    display_background_scrap: {
        type: Number,
        default: 0
    },
    product_feed: {
        type: Number,
        default: 0
    },
});



// // Execute before each user.save() call
settingSchema.pre('save', function(callback) {
    idGenerator.generateId('settings', 'setting_id', 'SET', (err, ID) => {
        this.setting_id = ID;
        callback();
    });
});

var Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;