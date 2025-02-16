const express = require('express');
const router = express.Router();
const path = require('path');
const {Spending} = require('../models/data');
const auth = require('../utils/auth'); 

router.get('/expense', (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','expense.html'))
})

router.post('/expense', auth,async (req, res) => {
    try {
        const { description, amount, types, category } = req.body;
        console.log('Received Data:', { description, amount, types, category });
        console.log(req.user.id)
        await Spending.create({
            description,
            amount,
            types,
            category,
            userId: req.user.id,
        });
        res.redirect('/added');
    } catch (error) {
        console.log(error);
        res.status(500).send(`<h1>Error adding expense</h1>`);
    }
});

module.exports = router