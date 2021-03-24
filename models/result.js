var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var resultSchema = new Schema({
    result_id: {
        type: String,
        default: ''
    },
    product_id: {
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
    Host: {
        type: String,
        default: ''
    },
    Img_key: {
        type: String,
        default: ''
    },
    Product_key: {
        type: String,
        default: ''
    },
    Brand_name: {
        type: String,
        default: ''
    },
    Product_Title: {
        type: String,
        default:''
    },
    Product_Url: {
        type: String,
        default:''
    },
    Img_url: {
        type: String,
        default:''
    },
    Mrp: {
        type: String,
        default:''
    },
    SellPrice: {
        type: String,
        default:''
    },
    Discount: {
        type: String,
        default:''
    },
    Colour: {
        type: String,
        default:''
    },
    Rating_Count: {
        type: String,
        default:''
    },
    Review_Count: {
        type: String,
        default:''
    },
    Rating_Star: {
        type: String,
        default:''
    },
    Time_stamp: {
        type: Date,
        default:Date.now
    },
    SS_update: {
        type: Number,
        default:0
    },
    CS_update: {
        type: Number,
        default:0
    },
    Query_count: {
        type: Number,
        default:0
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


var Result = mongoose.model('Result', resultSchema);
module.exports = Result;
