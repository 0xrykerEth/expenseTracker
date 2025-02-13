const express = require('express');
const router = express.Router();
const path = require('path');
const Expense = require('../models/data')

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'exist.html'));
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Expense.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        if (user.password !== password) {
            return res.status(400).json({ error: "Incorrect password" });
        }

        res.status(200).json({ message: "Logged in successfully!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;