const express = require('express');
const router = express.Router();
const path = require('path');
const {User} = require('../models/data')
const bcrypt = require('bcrypt'); 

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'form.html'));
});

router.post('/signup', async(req, res) => {
    try{
        const { name, email, password } = req.body;
    console.log('Received Data:', { name, email, password });

    const hashedPassword = await bcrypt.hash(password, 10)

    const users = await User.create({
        name,
        email,
        password : hashedPassword,
    });
    res.status(201).send(`<h1>User Added</h1>
            <h2><a href = 'http://localhost:3000/signup'>Go Back To Sign Up</a></h2>
        `);
    }catch(error) {
        console.log(error);
        res.status(403).send(`<h1>Email already Exists</h1>
            <h2><a href = 'http://localhost:3000/signup'>Go Back To Sign Up</a></h2>`);
    }
});

module.exports = router;
