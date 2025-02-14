const express = require('express');
const router = express.Router();
const path = require('path');
const {Spending} = require('../models/data');

router.get('/expense', (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','expense.html'))
})

router.post('/expense', async(req,res) => {
    try {
        const {description , amount , types , category} = req.body;
        console.log('Received Data:', { description , amount , types , category });

        const expenses = await Spending.create({
            description , 
            amount , 
            types , 
            category
        });
        res.redirect('/added');
    }catch(error) {
        console.log(error)
        res.status(403).send(`<h1>Email already Exists</h1>
        <h2><a href = 'http://localhost:3000/expense'>Go Back To Expense Page</a></h2>`);
    }
})

module.exports = router