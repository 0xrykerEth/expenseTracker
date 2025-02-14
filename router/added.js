const express = require('express');
const router = express.Router();
const {Spending} = require('../models/data');

router.get('/added', async (req, res) => {
    try {
        const expenses = await Spending.findAll();

        let tableRows = expenses.map(expense => `
            <tr>
                <td>${expense.description}</td>
                <td>${expense.amount}</td>
                <td>${expense.types}</td>
                <td>${expense.category}</td>
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
                        margin: 20px;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        margin: auto;
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
                <div class="container">
                    <h2>Expense List</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Type</th>
                                <th>Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.log(error);
        res.status(500).send(`<h1>Error fetching expenses</h1>`);
    }
});

module.exports = router;