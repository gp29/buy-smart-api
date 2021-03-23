var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');

var lottieSchema = new Schema({
    lottie_id: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    data: {
        type: Object,
        default: {}
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
lottieSchema.pre('save', function(callback) {
    idGenerator.generateId('lotties', 'lottie_id', 'LOT', (err, ID) => {
        this.lottie_id = ID;
        callback();
    });
});

var Lottie = mongoose.model('Lottie', lottieSchema);
module.exports = Lottie;