const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'form.html'));
});

router.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    console.log('Received Data:', { name, email, password });

    res.redirect('/signup');
});

module.exports = router;
