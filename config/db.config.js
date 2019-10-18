const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uri = process.env.MONGOURI || 'mongodb+srv://ecomuser:ecomuser123@ecombot-yxemk.mongodb.net/ecom?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(
    console.log(`[DB.CONFIG.JS] Remote Connection Successfull`)
).catch((error) => {
    // console.log('yes db error');
    console.log(error);
});

const product = new Schema({
    check: { default: '' },
    device: { type: String },
    brand: { type: String },
    product: { type: String },
    color: { type: String },
    url: { type: String },
    mp: { type: String, default: '' },
    image: { type: String },
    description: { type: String }
});

const invoice = new Schema({
    product: { type: String },
    image: { type: String },
    orderNumber: { type: String },
    paymentMethod: { type: String },
    price: { type: String },
    tax: { type: String },
    total: { type: String }
});

const order = new Schema({
    orderNumber: { type: String },
    status: { type: String, default: 'transit' },
    size: { type: String },
    reason: { type: String }
});

module.exports.ProductDb = mongoose.model('productdata', product);
module.exports.Invoice = mongoose.model('invoice', invoice);
module.exports.Order = mongoose.model('order', order);
