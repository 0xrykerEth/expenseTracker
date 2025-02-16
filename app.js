const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const sequelize = require('./utils/database');
const { User, Spending } = require('./models/data');
const app = express();
const signup = require('./router/signup.js');
const login = require('./router/singin.js')
const expense = require('./router/expense.js');
const added = require('./router/added.js')

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(expense);
app.use(login);
app.use(added);
app.use(signup);

app.get('/', (req, res) => {
    res.send(`<h1>Hello World</h1>`);
});

const server = http.createServer(app);

// Sync database and start server
sequelize.sync()
    .then(() => {
        server.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => {
        console.error('Unable to sync database:', err);
    });
