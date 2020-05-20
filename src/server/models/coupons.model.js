var mongoose = require('mongoose');

var CouponCodesSchema = mongoose.Schema({
    code: { 
        type: String,
        require: true,
        unique: true 
    },
    amount: { 
        type: Number,
        required: true
    },
    expireDate: { 
        type: String,
        required: true
    },
    isActive: { 
        type: Boolean,
        required: true,
        default: true
    }
});

var Coupons = mongoose.model('Coupons', CouponCodesSchema)

module.exports = Coupons;