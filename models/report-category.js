var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');

var reportCatSchema = new Schema({
    report_category_id: {
        type: String,
        default: ''
    },
    title: {
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
reportCatSchema.pre('save', function(callback) {
    idGenerator.generateId('report_categories', 'report_category_id', 'REC', (err, ID) => {
        this.report_category_id = ID;
        callback();
    });
});

var Report_category = mongoose.model('Report_category', reportCatSchema);
module.exports = Report_category;