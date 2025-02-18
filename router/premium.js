const express = require('express');
const router = express.Router();

router.use('/premium', (req,res) => {
    res.send('<h1>Hello This is premium user</h1>')
})


module.exports = router