const jwt = require('jsonwebtoken');
const { User } = require('../models/data');

module.exports = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized, no token provided' });
        }

        const decoded = jwt.verify(token, 'your_secret_key');

        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;

        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: 'Invalid token' });
    }
};
