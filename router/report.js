const express = require('express');
const router = express.Router();
const { Spending } = require('../models/data');
const auth = require('../utils/auth');
const { Op } = require('sequelize');
const stream = require('stream');
const bufferStream = require('buffer')
const fs = require('fs')
const path = require('path');
const fastCsv = require('fast-csv');
const AWS = require('aws-sdk');




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


        const groupedMonthlyExpenses = monthlyExpenses.reduce((acc, exp) => {
            const monthKey = new Date(exp.createdAt).toISOString().slice(0, 7);
            if (!acc[monthKey]) {
                acc[monthKey] = { month: monthKey, totalAmount: 0 };
            }
            acc[monthKey].totalAmount += exp.amount;
            return acc;
        }, {});        

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
                 <form id="downloadForm">
                    <label for="type">Type</label>
                    <select id="type" name="download" required>
                        <option value="day">DAY</option>
                        <option value="month">MONTH</option>
                        <option value="year">YEAR</option>
                    </select>
                    <button type="submit">Click to download</button>
                </form>

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
            <th>Month</th>
            <th>Total Amount</th>
        </tr>
    </thead>
    <tbody>
        ${Object.values(groupedMonthlyExpenses).map(({ month, totalAmount }) => `
            <tr>
                <td>${new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</td>
                <td>${totalAmount}</td>
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
                 <script>
                    document.getElementById("downloadForm").addEventListener("submit", function(event) {
                        event.preventDefault();
                        const type = document.getElementById("type").value;
                        window.location.href = "/download/" + type;
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const s3 = new AWS.S3({
    
    accessKeyId: 'AKIAX5ZI6NPQHSDIDF4E',
    secretAccessKey: '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',
    region: 'eu-north-1',
})

router.get('/download/:type', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.params;
        const now = new Date();

        let startDate;
        if (type === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (type === 'year') {
            startDate = new Date(now.getFullYear(), 0, 1);
        } else {
            return res.status(400).json({ message: 'Invalid type' });
        }

        const expenses = await Spending.findAll({
            where: { userId, createdAt: { [Op.gte]: startDate } },
            attributes: ['types', 'amount', 'createdAt']
        });

        if (expenses.length === 0) {
            return res.status(404).json({ message: 'No expenses found' });
        }

        let csvData = [];
        
        if (type === 'month') {
            const groupedMonthlyExpenses = expenses.reduce((acc, exp) => {
                const monthKey = new Date(exp.createdAt).toISOString().slice(0, 7);
                if (!acc[monthKey]) {
                    acc[monthKey] = { month: monthKey, totalAmount: 0 };
                }
                acc[monthKey].totalAmount += exp.amount;
                return acc;
            }, {});

            csvData = Object.values(groupedMonthlyExpenses);
        } else if (type === 'year') {
            let totalIncome = 0, totalExpense = 0;

            expenses.forEach(exp => {
                if (exp.types.toLowerCase() === 'income') {
                    totalIncome += exp.amount;
                } else {
                    totalExpense += exp.amount;
                }
            });

            csvData = [{ year: now.getFullYear(), totalIncome, totalExpense }];
        }

        const csvStream = fastCsv.format({ headers: true });
        const bufferStream = new stream.PassThrough();

        csvStream.pipe(bufferStream);
        csvData.forEach(row => csvStream.write(row));
        csvStream.end();

        const fileName = `expenses_${userId}_${type}_${Date.now()}.csv`;

        const uploadParams = {
            Bucket: 'expense11tracker',
            Key: `reports/${fileName}`,
            Body: bufferStream,
            ContentType: 'text/csv',
            ACL: 'private'
        };

        s3.upload(uploadParams, async (err, data) => {
            if (err) {
                console.error('S3 Upload Error:', err);
                return res.status(500).json({ message: 'Error uploading to S3' });
            }

            const signedUrl = s3.getSignedUrl('getObject', {
                Bucket: 'expense11tracker',
                Key: `reports/${fileName}`,
                Expires: 300
            });

            return res.json({ downloadUrl: signedUrl });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;

