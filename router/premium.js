const express = require('express');
const router = express.Router();
const { User, Spending } = require('../models/data');
const auth = require('../utils/auth');
const sequelize = require('../utils/database');

router.get('/premium', auth, async (req, res) => {
    try {
        const leaderboard = await User.findAll({
            attributes: ['id', 'name', [sequelize.fn('SUM', sequelize.col('spendings.amount')), 'totalSpent']],
            include: [{
                model: Spending,
                attributes: []
            }],
            group: ['user.id'],
            order: [[sequelize.fn('SUM', sequelize.col('spendings.amount')), 'DESC']]
        });

        let leaderboardRow = leaderboard.map(expense => `
            <tr>
                <td>${expense.id}</td>
                <td>${expense.name}</td>
                <td>${expense.get('totalSpent') || 0}</td>
            </tr>
        `).join('');

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Expense List</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                    }
                    .navigation {
                         display: flex;
                         justify-content: space-between;
                         align-items: center;
                         padding: 0;
                         margin: 0; /* Removes margin */
                         background-color: #007bff;
                         color: white;
                         width: 100%; 
                         box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
                         flex-shrink: 0;
                    }
                     h1 {
                        padding-left : 20px;
                     }
                    .button {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 20px;
                    }

                    .button button {
                        background-color: #28a745;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px; 
                        font-size: 16px;
                        color: white;
                        cursor: pointer;
                        transition: background-color 0.3s, transform 0.3s; 
                    }

                    .button button a {
                        color: white; 
                        text-decoration: none; 
                        display: block; 
                    }

                    .button button:hover {
                        background-color: #0056b3; 
                        transform: translateY(-3px); 
                    }

                    .button button:active {
                        background-color: #004085; 
                        transform: translateY(0); 
                    }


                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    }
                    h2 {
                        text-align: center;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    table, th, td {
                        border: 1px solid #ddd;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                    }
                    th {
                        background-color: #007bff;
                        color: white;
                    }
                </style>
            </head>
            <body>
                <nav class="navigation">
                    <h1>Expense Tracker</h1>
                     <div class="button">
                        <button class="btn"><a href="http://localhost:3000/expense">Expense Table</a></button>
                        <button class="btn"><a href="http://localhost:3000/login">Log Out</a></button>
                    </div>
                </nav>
                <div class="container">
                    <h2>LeaderBoard Lists</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Amount</th>
                            </tr>
                            
                        </thead>
                        <tbody>
                            ${leaderboardRow}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
