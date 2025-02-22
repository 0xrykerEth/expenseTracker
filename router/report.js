const express = require('express');
const router = express.Router();
const { Spending } = require('../models/data');
const auth = require('../utils/auth');
const { Op } = require('sequelize');

router.get('/report', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const dailyExpenses = await Spending.findAll({ 
            where: { userId, createdAt: { [Op.gte]: startOfDay } },
            attributes: ['description', 'category', 'amount', 'createdAt']
        });

        const monthlyExpenses = await Spending.findAll({ 
            where: { userId, createdAt: { [Op.gte]: startOfMonth } },
            attributes: ['types', 'amount', 'createdAt']
        });

        const yearlyExpenses = await Spending.findAll({ 
            where: { userId, createdAt: { [Op.gte]: startOfYear } },
            attributes: ['types', 'amount', 'createdAt']
        });

        let totalIncome = 0;
        let totalExpense = 0;

        yearlyExpenses.forEach(exp => {
            if (exp.types.toLowerCase() === 'income') {
                totalIncome += exp.amount;
            } else {
                totalExpense += exp.amount;
            }
        });

        const savings = totalIncome - totalExpense;

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Expense Report</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        text-align: center;
                    }
                    .container {
                        max-width: 800px;
                        margin: 50px auto;
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    }
                    h2 {
                        color: #333;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        padding: 10px;
                        text-align: center;
                        border: 1px solid #ddd;
                    }
                    th {
                        background-color: #007bff;
                        color: white;
                    }
                    button {
                        background-color: #007bff;
                        color: white;
                        padding: 10px 15px;
                        border: none;
                        cursor: pointer;
                        margin: 20px;
                        font-size: 16px;
                        border-radius: 5px;
                    }
                    button:hover {
                        background-color: #0056b3;
                    }
                    @media print {
                        button {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <button onclick="window.print()">Print as PDF</button>

                <div class="container">
                    <h2>Day to Day Expenses</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dailyExpenses.map(exp => `
                                <tr>
                                    <td>${new Date(exp.createdAt).toLocaleDateString()}</td>
                                    <td>${exp.description}</td>
                                    <td>${exp.category}</td>
                                    <td>${exp.amount}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <h2>Monthly Report</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Types</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${monthlyExpenses.map(exp => `
                                <tr>
                                    <td>${new Date(exp.createdAt).toLocaleDateString()}</td>
                                    <td>${exp.types}</td>
                                    <td>${exp.amount}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <h2>Yearly Report</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Income</th>
                                <th>Expense</th>
                                <th>Savings</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${now.getFullYear()}</td>
                                <td>${totalIncome}</td>
                                <td>${totalExpense}</td>
                                <td>${savings}</td>
                            </tr>
                        </tbody>
                    </table>

                    <h2>Summary</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Period</th>
                                <th>Total Expense</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Today</td>
                                <td>${dailyExpenses.reduce((sum, exp) => sum + exp.amount, 0) || 0}</td>
                            </tr>
                            <tr>
                                <td>This Month</td>
                                <td>${monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0) || 0}</td>
                            </tr>
                            <tr>
                                <td>This Year</td>
                                <td>${totalExpense || 0}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
