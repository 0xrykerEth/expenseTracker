const express = require('express');
const router = express.Router();
const path = require('path');


router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'exist.html'));
});

module.exports = router;