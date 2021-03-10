var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');

var productSchema = new Schema({
    product_id: {
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
        type: Number,
        default:0
    },
    SellPrice: {
        type: Number,
        default:0
    },
    Discount: {
        type: Number,
        default:0
    },
    Colour: {
        type: String,
        default:''
    },
    Rating_Count: {
        type: Number,
        default:0
    },
    Review_Count: {
        type: Number,
        default:0
    },
    Rating_Star: {
        type: Number,
        default:0
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

// // Execute before each user.save() call
productSchema.pre('save', function(callback) {
    idGenerator.generateId('products', 'product_id', 'PRO', (err, ID) => {
        this.product_id = ID;
        callback();
    });
});

var Product = mongoose.model('Product', productSchema);
module.exports = Product;