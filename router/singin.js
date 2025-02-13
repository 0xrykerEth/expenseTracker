const express = require('express');
const router = express.Router();
const path = require('path');
const Expense = require('../models/data')
const bcrypt = require('bcrypt');

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'exist.html'));
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Expense.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }


        res.status(200).json({ message: "Logged in successfully!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;