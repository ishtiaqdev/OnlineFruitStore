var mongoose = require('mongoose');

var paymentSchema = mongoose.Schema({
    subtotal: String,
    quantity: String,
    isPaid: Boolean,
    userId: Number
});

var Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;