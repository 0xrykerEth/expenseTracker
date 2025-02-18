const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');


router.get('/check-premium', auth, (req, res) => {
    if (req.user && req.user.isPremium) {
        res.redirect('/premium');
    } else {
        
        res.redirect('/pay');
    }
});




module.exports = router;
