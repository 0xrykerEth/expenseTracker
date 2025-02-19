const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const sequelize = require('./utils/database');
const app = express();
const signup = require('./router/signup.js');
const login = require('./router/singin.js')
const expense = require('./router/expense.js');
const added = require('./router/added.js');
const pay = require('./router/pay.js')
const payment = require('./router/payment.js')
const status = require('./router/status.js')
const path = require('path');
const premium = require('./router/premium.js')
const check = require('./router/check-premium.js')
const forgot = require('./router/forgot.js')

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(forgot)
app.use(check);
app.use(premium);
app.use(status);
app.use(payment);
app.use(pay)
app.use(expense);
app.use(login);
app.use(added);
app.use(signup);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'views','exist.html'));
});

const server = http.createServer(app);


sequelize.sync()
    .then(() => {
        server.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => {
        console.error('Unable to sync database:', err);
    });
