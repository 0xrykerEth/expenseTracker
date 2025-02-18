const express = require('express');
const router = express.Router();
const path = require('path');
const {Order} = require('../models/data')
const { Cashfree } = require("cashfree-pg");
const auth = require('../utils/auth');

Cashfree.XClientId = "TEST430329ae80e0f32e41a393d78b923034";
Cashfree.XClientSecret = "TESTaf195616268bd6202eeb3bf8dc458956e7192a85";
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

router.get("/pay", (req, res) => {
    res.sendFile(path.join(__dirname,'../','views','index.html'));
});


router.post("/pay", auth,async (req, res) => {
    try {
        const { customer_id, customer_phone } = req.body;
        const orderId = `order_${Date.now()}`;
        const request = {
            order_amount: '100',
            order_currency: "INR",
            order_id: orderId,
            customer_details: { customer_id, customer_phone },
            order_meta: {
                return_url: `http://localhost:3000/status/${orderId}`
            }
        };
        console.log('Reached and redirected to payment page');
        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        console.log("Cashfree Response:", response.data);

        const newOrder = await Order.create({
            orderId: orderId,
            userId: req.user.id,  
            status: "Pending",
        });
        if (response.data?.payment_session_id) {
            const paymentSessionId = response.data.payment_session_id;
            res.redirect(`/payment?session_id=${paymentSessionId}`);
        } else {
            res.status(400).json({ error: "Failed to create order" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
});

module.exports = router;