const express = require('express');
const router = express.Router();
const path = require('path');
const {User} = require('../models/data')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'exist.html'));
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '24h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/expense'); 

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;