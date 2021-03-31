var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');

var scrapSchema = new Schema({
    scrap_id: {
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
scrapSchema.pre('save', function(callback) {
    idGenerator.generateId('scraps', 'scrap_id', 'SCR', (err, ID) => {
        this.scrap_id = ID;
        callback();
    });
});

var Scrap = mongoose.model('Scrap', scrapSchema);
module.exports = Scrap;