var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const idGenerator = require('./../utils/id-generator');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

var productSchema = new Schema({
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

// // Execute before each user.save() call
productSchema.pre('save', function(callback) {
    idGenerator.generateId('products', 'product_id', 'PRO', (err, ID) => {
        this.product_id = ID;
        callback();
    });
});


productSchema.plugin(autoIncrement.plugin, {
    model: 'Product',
    field: 'Index',
    startAt: 1,
    incrementBy: 1,
    type: Number
});

var Product = mongoose.model('Product', productSchema);
module.exports = Product;