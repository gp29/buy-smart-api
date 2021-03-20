var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');

var feedSchema = new Schema({
    feed_id: {
        type: String,
        default: ''
    },
    Index: {
        type: Number,
        default: 0
    },
    Img_key: {
        type: String,
        default: ''
    },
    Img_url: {
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
feedSchema.pre('save', function(callback) {
    idGenerator.generateId('feeds', 'feed_id', 'FED', (err, ID) => {
        this.feed_id = ID;
        callback();
    });
});


var Feed = mongoose.model('Feed', feedSchema);
module.exports = Feed;