const Sequelize = require('sequelize')

const sequelize = new Sequelize('expense','root','rajatraj',{
    dialect: 'mysql',
    host: 'localhost',
})
module.exports = sequelize;