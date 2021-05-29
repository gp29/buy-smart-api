var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tempscrapSchema = new Schema({
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


var Temp_scrap = mongoose.model('Temp_scrap', tempscrapSchema);
module.exports = Temp_scrap;