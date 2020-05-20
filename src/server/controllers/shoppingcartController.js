const express = require('express');
var router = express.Router();

// Models
var Products = require('../models/products.model.js');
var SelectedProducts = require('../models/selectedproducts.model.js');
var Payment = require('../models/payment.model.js');
var Coupons = require('../models/coupons.model');


//setup products.
router.get('/setup', (req, res) => {
    // Save Products master set
    let productA = new Products({ id: '1', name: 'Apple', price:'12.0', currency:'€', image:'Apple.jpg' });
    productA.save((err) => {console.log('product A saved successfully');});
    let productB = new Products({ id: '2', name: 'Banana', price:'10.0', currency:'€', image:'Banana.jpg' });
    productB.save((err) => {console.log('product B saved successfully');});
    let productC = new Products({ id: '3', name: 'Orange', price:'7.0', currency:'€', image:'Orange.jpg' });
    productC.save((err) => {console.log('product C saved successfully');});
    let productD = new Products({ id: '4', name: 'Pear', price:'5.0', currency:'€', image:'Pear.jpg' });
    productD.save((err) => {console.log('product D saved successfully');});

    let createdProducts = [ productA.name, productB.name, productC.name, productD.name ]
    res.json('These products have been added successfully: \n' + createdProducts);
});

router.get('/generatecoupons/:seconds', (req, res) => {
    //Generate and save new coupons

    let numberSeconds = (req.params.seconds != null ? parseInt(req.params.seconds) : 10); //default 10 seconds
    let secondsToSave = (!isNaN(numberSeconds) ? numberSeconds : 10); //default 10 seconds

    let coupon1 = new Coupons({ code: couponGenerator(), amount: 30, 
        expireDate: addSecondsToDateTime(Date.now(), secondsToSave).toISOString(), isActive: true });
    coupon1.save((err) => {console.log('coupon 1 saved successfully');});
    let coupon2 = new Coupons({ code: couponGenerator(), amount: 30, 
        expireDate: addSecondsToDateTime(Date.now(), secondsToSave).toISOString(), isActive: true });
    coupon2.save((err) => {console.log('coupon 2 saved successfully');});
    let coupon3 = new Coupons({ code: couponGenerator(), amount: 30, 
        expireDate: addSecondsToDateTime(Date.now(), secondsToSave).toISOString(), isActive: true });
    coupon3.save((err) => {console.log('coupon 3 saved successfully');});
    let coupon4 = new Coupons({ code: couponGenerator(), amount: 30, 
        expireDate: addSecondsToDateTime(Date.now(), secondsToSave).toISOString(), isActive: true });
    coupon4.save((err) => {console.log('coupon 4 saved successfully');});
    let coupon5 = new Coupons({ code: couponGenerator(), amount: 30, 
        expireDate: addSecondsToDateTime(Date.now(), secondsToSave).toISOString(), isActive: true });
    coupon5.save((err) => {console.log('coupon 5 saved successfully');});

    let couponsCodes = [coupon1.code, coupon2.code, coupon3.code, coupon4.code, coupon5.code]

    res.json('These coupons have been added successfully valid for ' + secondsToSave + ' seconds only from now onwards: \n' + couponsCodes);
});

// get all products
router.get('/products', (req, res) => {
        Products.find({}, (err, docs) => {
        if(err) return console.error(err);
        res.json(docs);
    });
});

//Can be used for getting one product
router.get('/products/:id', (req, res) => {
    Products.findOne({ id: req.params.id }, (err, data) => {
        if (err) return console.error(err);
        res.json(data);
    })
});

// get all selected products
router.get('/selectedproducts/:userid', (req, res) => {
    let productsArr = [];
    let productsList = [];
    let userid = req.params.userid;

    Products.find({}).lean().exec((err, productInfo) => {
        productsArr = productInfo;
        SelectedProducts.find({ userId: userid, isActive: true }).lean().exec((err, products) => {
            for (let i = 0; i < products.length; i++) {
                for (let j in productsArr) {
                    if (productsArr[j].id == products[i].id) {
                        products[i].info = productsArr[j];
                    }
                }
            }
            productsList = products;
            return res.json(productsList);
        });
    });
});

// create
router.post('/selectedproducts', (req, res) => {

    var productId = req.body.id;
    var userid = req.body.userid;
    var quantity = req.body.quantity;
    
    SelectedProducts.findOne({ id: productId, userId: userid, isActive: true }, (err, product) => {
        if(!err) {
            if (!product) {
                product = new SelectedProducts({ id: productId, quantity: quantity, userId: userid, isActive: true });
                console.log('product2:' + JSON.stringify(product))
                product.save((err) => {
                    if (!err) {
                        SelectedProducts.find({ userId: userid, isActive: true }, (err, userProducts) => {
                            if (!err) {
                                calculatePayableAmount(productId, userid, "ADD", "Dashboard", quantity, 0, userProducts, req, res);
                            }
                            else {
                                console.log("Something wrong when fetching user's products data!");
                            }
                        });
                    }
                    else
                    {
                        console.log('Something wrong when updating data!')
                    }
                });
            }
            else {
                console.log('product2:' + JSON.stringify(product));
                let newQuantity = parseInt(quantity);
                let oldQuantity = parseInt(product.quantity);
                console.log('quantity:' + newQuantity);

                SelectedProducts.findOneAndUpdate({ id: productId, userId: userid, isActive: true }, { $set: { quantity: (newQuantity + oldQuantity) } }, { upsert: true, new: true }, (err, doc) => {
                    if (!err) {
                        SelectedProducts.find({ userId: userid, isActive: true }, (err, userProducts) => {
                            if (!err) {
                                calculatePayableAmount(productId, userid, "EDIT", "Dashboard", newQuantity, oldQuantity, userProducts, null, null);
                            }
                            else {
                                console.log("Something wrong when fetching user's products data!");
                            }
                        });
                    }
                    else {
                        console.log("Something wrong when updating data!");
                    }
                });
            }
        }
    });
    res.json('Item added to cart successfully.');
});

// update products
router.post('/updateselectedproducts', (req, res) => {
    
    let productId = req.body.id;
    let oldQuantity = req.body.old_quantity;
    let newQuantity = req.body.new_quantity;

    let userid = req.body.userid;

    SelectedProducts.findOneAndUpdate({ id: productId, userId: userid, isActive: true }, { $set: { quantity: newQuantity } }, { upsert: true, new: true }, (err, doc) => {
        if (err) {
            console.log("Something wrong when updating data!");
        }
        else {
            SelectedProducts.find({ userId: userid, isActive: true }, (err, userProducts) => {
                if (!err) {
                    calculatePayableAmount(productId, userid, "EDIT", "Order", newQuantity, oldQuantity, userProducts, req, res);
                }
                else {
                    console.log("Something wrong when fetching user's products data!");
                }
            });
        }
    });
});

// delete products
router.post('/deleteselectedproducts', (req, res) => {

    let productId = req.body.id;
    let quantity = req.body.quantity;
    let userid = req.body.userid;

    SelectedProducts.findOneAndRemove({ id: productId, userId: userid, isActive: true }, (err) => {
        if (!err) {
            SelectedProducts.find({ userId: userid, isActive: true }, (err, userProducts) => {
                if (!err) {
                    calculatePayableAmount(productId, userid, "REMOVE", "Order", quantity, 0, userProducts, req, res);
                }
                else {
                    console.log("Something wrong when fetching user's products data!");
                }
            });    
        }
        else {
            console.log(err)
        }
    });
});

//calculate total for userid
router.get('/calculateTotal/:userid', (req, res) => {
    let userid = req.params.userid;

    calculateTotalForUserAndCoupon(userid, null, req, res);
});

//calculate total for userid and coupon code
router.get('/calculateTotalAfterCoupon/:userid/:couponcode', (req, res) => {
    let userid = req.params.userid;
    let couponcode = req.params.couponcode;
    
    calculateTotalForUserAndCoupon(userid, couponcode, req, res);
});

function calculateTotalForUserAndCoupon(userid, couponcode, req, res)
{
    let _subTotal = 0;
    let _discount = 0;
    let _netAmount = 0;
    let _quantity = 0;
    let enableDiscount = false;

    Products.find({}, (err, products) => {
        if(!err) {
            if(products) {
                if(products.length > 0) {
                    let applePrice = products.find(p => p.id == 1).price;
                    let bananaPrice = products.find(p => p.id == 2).price;
                    let orangePrice = products.find(p => p.id == 3).price;
                    let pearPrice = products.find(p => p.id == 4).price;
                    let prices = { applePrice, bananaPrice, orangePrice, pearPrice };

                    Payment.findOne({ userId: userid, isPaid: false }, (err, paymentdata) => {
                        if (!err) {
                            if (paymentdata) {
                                _subTotal = parseFloat(paymentdata.subtotal);
                                _quantity = parseInt(paymentdata.quantity);
                
                                SelectedProducts.find({ userId: userid, isActive: true }, (err, selectedProducts) => {
                                    if (!err) {
                                        if (selectedProducts) {
                                            let enableAppleDiscount = false;
                                            let enablePearBananaDiscount = false;
                                            let pearsBananaDiscountCountSets = 0;
                
                                            let apples = selectedProducts.find(p => p.id == 1); //Apple ID is 1
                                            let bananas = selectedProducts.find(p => p.id == 2); //Pear ID is 2
                                            let oranges = selectedProducts.find(p => p.id == 3); //Pear ID is 3
                                            let pears = selectedProducts.find(p => p.id == 4); //Pear ID is 4
                
                                            let pearSets;
                                            let bananaSets;
                                            if(pears != null && pears != undefined)
                                            {
                                                pearSets = parseInt(pears.quantity / 4); //getting sets of pears
                                            }
                                            if(bananas != null && bananas != undefined)
                                            {
                                                bananaSets = parseInt(bananas.quantity / 2); //getting sets of pears
                                            }

                                            if(pearSets > 0 && bananaSets > 0)
                                            {
                                                enablePearBananaDiscount = true;
                                                if(pearSets < bananaSets)
                                                    pearsBananaDiscountCountSets = pearSets; //setting minimum sets of 4 pears and 2 bananas
                                                else
                                                    pearsBananaDiscountCountSets = bananaSets; //setting minimum sets of 4 pears and 2 bananas
                                            }
                
                                            if(apples)
                                            {
                                                if(apples.quantity >= 7)
                                                {
                                                    enableAppleDiscount = true;
                                                }
                                            }
                
                                            let discountDataToPass = { enableAppleDiscount, enablePearBananaDiscount,
                                                pearsBananaDiscountCountSets, apples, bananas, oranges, pears
                                            };

                                            var couponMessage = '';
                                            var couponStatus = false;
                                            if(couponcode != null)
                                            {
                                                Coupons.findOne({ code: couponcode }, (err, couponsData) => {
                                                    if (!err) {
                                                        if (couponsData) {
                                                            if(!couponsData.isActive)
                                                            {
                                                                couponMessage = 'This coupon has already been used.'
                                                                couponStatus = false;
                                                                let amountData = calculateTotalPriceAndDiscount(_subTotal, _discount, _netAmount, _quantity, enableDiscount, discountDataToPass, prices, null, couponMessage, couponStatus);
                                                                return res.json({ subTotal: amountData._subTotal.toString(), discount: amountData._discount.toString(), netAmount: amountData._netAmount.toString(), 
                                                                    enableDiscount: amountData.enableDiscount, coupon: couponcode, couponMessage: amountData.couponMessage, couponStatus: amountData.couponStatus });
                                                            }
                                                            else if(new Date(couponsData.expireDate) > Date.now())
                                                            {
                                                                let amountData = calculateTotalPriceAndDiscount(_subTotal, _discount, _netAmount, _quantity, enableDiscount, discountDataToPass, prices, couponcode, couponMessage, couponStatus);
                                                                return res.json({ subTotal: amountData._subTotal.toString(), discount: amountData._discount.toString(), netAmount: amountData._netAmount.toString(), 
                                                                    enableDiscount: amountData.enableDiscount, coupon: couponcode, couponMessage: amountData.couponMessage, couponStatus: amountData.couponStatus });
                                                            }
                                                            else {
                                                                couponMessage = 'This coupon has been expired.'
                                                                couponStatus = false;
                                                                let amountData = calculateTotalPriceAndDiscount(_subTotal, _discount, _netAmount, _quantity, enableDiscount, discountDataToPass, prices, null, couponMessage, couponStatus);
                                                                return res.json({ subTotal: amountData._subTotal.toString(), discount: amountData._discount.toString(), netAmount: amountData._netAmount.toString(), 
                                                                    enableDiscount: amountData.enableDiscount, coupon: couponcode, couponMessage: amountData.couponMessage, couponStatus: amountData.couponStatus });
                                                            }
                                                        }
                                                        else {
                                                            couponMessage = 'This coupon is not available.'
                                                            couponStatus = false;
                                                            let amountData = calculateTotalPriceAndDiscount(_subTotal, _discount, _netAmount, _quantity, enableDiscount, discountDataToPass, prices, null, couponMessage, couponStatus);
                                                            return res.json({ subTotal: amountData._subTotal.toString(), discount: amountData._discount.toString(), netAmount: amountData._netAmount.toString(), 
                                                                enableDiscount: amountData.enableDiscount, coupon: couponcode, couponMessage: amountData.couponMessage, couponStatus: amountData.couponStatus });
                                                        }
                                                    }
                                                });
                                            }
                                            else {
                                                let amountData = calculateTotalPriceAndDiscount(_subTotal, _discount, _netAmount, _quantity, enableDiscount, discountDataToPass, prices, null, couponMessage, couponStatus);
                                                return res.json({ subTotal: amountData._subTotal.toString(), discount: amountData._discount.toString(), netAmount: amountData._netAmount.toString(), 
                                                    enableDiscount: amountData.enableDiscount, coupon: couponcode, couponMessage: amountData.couponMessage, couponStatus: amountData.couponStatus });
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    });   
                }
            }
        }
    });
}

function calculateTotalPriceAndDiscount(_subTotal, _discount, _netAmount, _quantity, enableDiscount, discountDataPassed, prices, couponcode, couponMessage, couponStatus) 
{
    var _appleDiscount = 0;
    var _pearAndBananaDiscount = 0;
    var _orangeDiscount = 0;

    if (discountDataPassed.enableAppleDiscount)
    {
        if(discountDataPassed.apples != null && discountDataPassed.apples != undefined)
        {
            enableDiscount = true;
            _appleDiscount = 0.1 * discountDataPassed.apples.quantity * prices.applePrice; //10% discount applied to apples
        }
    }

    if(discountDataPassed.enablePearBananaDiscount)
    {
        for(let i = 0; i < discountDataPassed.pearsBananaDiscountCountSets; i++)
        {
            enableDiscount = true;
            let pearsAmount = 4 * prices.pearPrice;
            let bananaAmount = 2 * prices.bananaPrice;
            _pearAndBananaDiscount += 0.3 * (pearsAmount + bananaAmount); //30% discount applied to apples
        }
    }

    if(couponcode != null)
    {
        if(discountDataPassed.oranges != null && discountDataPassed.oranges != undefined)
        {
            enableDiscount = true;
            _orangeDiscount = 0.3 * discountDataPassed.oranges.quantity * prices.orangePrice;
            couponMessage = "Coupon code applied to oranges successfully.";
            couponStatus = true;
            Coupons.findOneAndUpdate({ code: couponcode, isActive: true }, { $set: { isActive: false } }, { upsert: true, new: true }, (err, doc) => {
                if (err) {
                    console.log("Something wrong when updating coupons data!");
                }
                console.log("updated" + JSON.stringify(doc));
                console.log('coupon updated successfully');
            });
        }
        else
        {
            couponMessage = "No orange selected, so coupon cannot be applied.";
            couponStatus = false;
        }
    }
    _discount = _appleDiscount + _pearAndBananaDiscount + _orangeDiscount;
    _netAmount = parseFloat(_subTotal) - parseFloat(_discount);

    let amountData = {
        _subTotal: parseFloat(_subTotal).toFixed(2),
        _discount: parseFloat(_discount).toFixed(2),
        _netAmount: parseFloat(_netAmount).toFixed(2),
        enableDiscount,
        couponMessage,
        couponStatus
    }
    return amountData;
}

function addSecondsToDateTime(date, seconds)
{
    return new Date(new Date(date).setSeconds(new Date(date).getSeconds() + seconds));
}

//Calculate Payable Amount.
var calculatePayableAmount = function(productId, userid, mode, source, newQuantity, oldQuantity, userProducts, req, res)
{
    let price = 0;
    let userProductsIds = [];
    let quantity = parseInt(newQuantity) + parseInt(oldQuantity);
    let subTotal = 0;

    if(userProducts != null)
    {
        if(userProducts.length > 0) {
            for(let i=0; i < userProducts.length; i++)
            {
                userProductsIds.push(userProducts[i].id);
            }
        }
        else {
            userProductsIds.push(productId);
        }
    }
    else {
        userProductsIds.push(productId);
    }
    Products.find({ id: { $in: userProductsIds } }, (err, products) => {
        if (!err) {
            if (products) {
                let currentProduct = products.find(p => p.id == productId);
                price = parseFloat(currentProduct != undefined ? currentProduct.price : 0);

                Payment.findOne({ userId: userid, isPaid: false }, (err, data) => {
                    if (!err) {
                        if (!data && mode == "ADD") {
                            subTotal = (parseFloat(price) * quantity).toString();
                            data = new Payment({ subtotal: subTotal, quantity: quantity, isPaid: false, userId: userid });
                            data.save((err) => { console.log('Payment saved successfully'); });
                        }
                        else
                        { //EDIT and REMOVE Cases
                            quantity = 0;
                            if(userProducts != null)
                            {
                                for(let i=0; i < userProducts.length; i++)
                                {
                                    quantity += userProducts[i].quantity;
                                    subTotal += parseFloat(products.find(p => p.id == userProducts[i].id).price) * userProducts[i].quantity;
                                }
                            }
                            Payment.findOneAndUpdate({ userId: userid }, { $set: { quantity: quantity, subtotal: subTotal, isPaid: false } }, { upsert: true, new: true }, (err, doc) => {
                                if (!err) {
                                    console.log("updated" + JSON.stringify(doc));
                                    console.log('payment updated successfully');
                                    if(source == "Order")
                                    {
                                        calculateTotalForUserAndCoupon(userid, null, req, res);
                                    }
                                }
                                else{
                                    console.log("Something wrong when updating data!");
                                }
                            });
                        }

                    }
                });
            }
        }
    });
}

//Submit order
router.post('/submitorder', (req, res) => {
    try {
        Payment.findOneAndUpdate({ userId: req.body.id, isPaid: false }, { $set: { isPaid: true } }, { upsert: true, new: true }, (err, doc) => {
            if (!err) {
                if(doc)
                {
                    SelectedProducts.updateMany({ userId: req.body.id, isActive: true }, { $set: { isActive: false } }, { upsert: true, new: true }, (err, selectedDoc) => {
                        if (!err) {
                            if(selectedDoc)
                            {
                                res.json("Congratulations! Your order has been placed succesfully.")
                                // const transporter = nodemailer.createTransport({
                                //     service: 'gmail',
                                //     auth: {
                                //         user: 'user@gmail.com',
                                //         pass: 'abcd@123'
                                //     }
                                // });
                        
                                // let mailOptions = {
                                //     from: 'testuser@gmail.com',
                                //     to: 'testemail@gmail.com',
                                //     subject: "Congratulations! Your order has been placed succesfully.", // Subject line
                                //     text: `Hello ${user.firstName}` + ` ${user.lastName}`, // plain text body
                                //     html: `Hello ${user.firstName}` + ` ${user.lastName}`
                                // }
                                // // send mail with defined transport object
                                // transporter.sendMail(mailOptions, function (error, info) {
                                //     if (error) {
                                //         console.log(error);
                                //         return res.json(error);
                                //     } else {
                                //         console.log('Email sent: ' + info.res);
                                //         return res.json(result);
                                //     }
                                // });                    
            
                            }
                        }
                    });
                }
            }
            else {
                console.log("Something wrong when updating data!");
            }
        });
    } catch (error) {
        if (error != null) res.status(500).send({ error: error.message });
    }
});

function couponGenerator() {
    let coupon = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 4; i++) {
        coupon += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return coupon;
}

module.exports = router;