const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/database')

const Expense = sequelize.define('user', {
    id : {
        type : DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name : {
        type: DataTypes.STRING,
        allowNull: false
    },
    email : {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password : {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'user',
    timestamps: false
});

const Spending = sequelize.define('spending', {
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true,
    },
    description : {
        type : DataTypes.STRING,
        allowNull: false,
    },
    amount : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    types : {
        type : DataTypes.STRING,
        allowNull : false,
    },
    category : {
        type : DataTypes.STRING,
        allowNull : false
    }
}, {
    tableName: 'spending',
    timestamps: false
})

module.exports = {Expense, Spending};