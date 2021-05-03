var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');

var bannerSchema = new Schema({
    banner_id: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    url: {
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
bannerSchema.pre('save', function(callback) {
    idGenerator.generateId('banners', 'banner_id', 'BAN', (err, ID) => {
        this.banner_id = ID;
        callback();
    });
});

var Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;