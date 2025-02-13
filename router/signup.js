const express = require('express');
const router = express.Router();
const path = require('path');
const Expense = require('../models/data')

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'form.html'));
});

router.post('/signup', async(req, res) => {
    try{
        const { name, email, password } = req.body;
    console.log('Received Data:', { name, email, password });

    const users = await Expense.create({
        name,
        email,
        password
    });
    res.status(201).send(`<h1>User Added</h1>
            <h2><a href = 'http://localhost:3000/signup'>Go Back To Sign Up</a></h2>
        `);
    }catch(error) {
        res.status(403).send(`<h1>Email already Exists</h1>
            <h2><a href = 'http://localhost:3000/signup'>Go Back To Sign Up</a></h2>`);
    }
});

module.exports = router;
