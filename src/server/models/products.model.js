var mongoose = require('mongoose');

var productSchema = mongoose.Schema({
    id: String,
    name: String,
    price: String,
    currency: String,
    image: String
});

var Products = mongoose.model('Products', productSchema);

module.exports = Products;