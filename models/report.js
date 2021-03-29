var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');

var reportSchema = new Schema({
    report_id: {
        type: String,
        default: ''
    },
    user_id: {
        type: String,
        default: ''
    },
    report_category_id: {
        type: Array,
        default: []
    },
    message: {
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
reportSchema.pre('save', function(callback) {
    idGenerator.generateId('reports', 'report_id', 'REP', (err, ID) => {
        this.report_id = ID;
        callback();
    });
});

var Report = mongoose.model('Report', reportSchema);
module.exports = Report;