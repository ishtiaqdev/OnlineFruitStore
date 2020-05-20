var mongoose = require('mongoose');

var selectedProductSchema = mongoose.Schema({
    id: String,
    quantity: Number,
    userId: Number,
    isActive: Boolean
});

var SelectedProducts = mongoose.model('SelectedProducts', selectedProductSchema);

module.exports = SelectedProducts;