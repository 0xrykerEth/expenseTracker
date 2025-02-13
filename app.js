const http = require('http');
const express = require('express');
const app = express();
const signup = require('./router/signup.js');

app.use(express.urlencoded({ extended: false }));


app.use(signup);

app.get('/', (req, res) => {
    res.send(`<h1>Hello World</h1>`);
});

const server = http.createServer(app);

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
