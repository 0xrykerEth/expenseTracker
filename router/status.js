const express = require('express');
const { Cashfree } = require("cashfree-pg");
const router = express.Router();
const {Order,User} = require('../models/data')

Cashfree.XClientId = "TEST430329ae80e0f32e41a393d78b923034";
Cashfree.XClientSecret = "TESTaf195616268bd6202eeb3bf8dc458956e7192a85";
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

router.get("/status/:orderId", async (req, res) => {
    const { orderId } = req.params; 

    if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
    }
    
    try {
        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
        console.log('Order fetched successfully:', response.data);

        if (!Array.isArray(response.data) || response.data.length === 0) {
            return res.send(`<h1>No payments found for Order ${orderId}</h1>`);
        }

        const payment = response.data.find(entry => entry.order_id === orderId);
        if (!payment) {
            return res.send(`<h1>No matching payment found for Order ${orderId}</h1>`);
        }
        

        let orderStatus = payment.payment_status === "SUCCESS" ? "Success" :
                          payment.payment_status === "PENDING" ? "Pending" :
                          "Failure";

        await Order.update(
        { status: orderStatus},  
        { where: { orderId } }   
        );

        if (orderStatus === "Success") {
            const order = await Order.findOne({ where: { orderId } });
            
            if (order) {
                await User.update(
                    { isPremium: true }, 
                    { where: { id: order.userId } } 
                );
                return res.send(`<h1>Payment Success! User upgraded to Premium.</h1>
                                    <button><a href="http://localhost:3000/expense">Return To expenses</a></button>`);
            }
        }
        res.send(`<h1>Payment ${orderStatus} for Order ${orderId}</h1>`);
    } catch (error) {
        console.error('Error:', error.response?.data?.message || error.message);
        res.status(500).json({ error: "Failed to fetch payment status" });
    }
});


module.exports = router;
