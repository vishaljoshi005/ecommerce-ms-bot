const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uri = process.env.MONGOURI;

// console.log(`[DB.CONFIG.JS] ${ uri }`);
// const uri = 'mongodb+srv://ecomuser:ecomuser123@ecombot-yxemk.mongodb.net/ecom?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(
    // console.log(`[DB.CONFIG.JS] Remote Connection Successfull`)
).catch((error) => {
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

module.exports.ProductDb = mongoose.model('productdata', product);
