const express = require('express');
const router = express.Router();
const { Spending } = require('../models/data');
const auth = require('../utils/auth');

router.get('/added', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        const totalExpenses = await Spending.count({
            where: { userId: req.user.id }
        });

        const totalPages = Math.ceil(totalExpenses / limit);

        const expenses = await Spending.findAll({
            where: { userId: req.user.id },
            limit,
            offset
        });

        let tableRows = expenses.map(expense => `
            <tr>
                <td>${expense.id}</td>
                <td>${expense.description}</td>
                <td>${expense.amount}</td>
                <td>${expense.types}</td>
                <td>${expense.category}</td>
                <td>
                    <form action="/expense/delete" method="POST">
                        <input type="hidden" name="id" value="${expense.id}">
                        <button type="submit" class="delete-btn">Delete</button>
                    </form>
                </td>
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
                    .delete-btn {
                        background-color: red;
                        color: white;
                        border: none;
                        padding: 5px 10px;
                        cursor: pointer;
                    }
                    .pagination {
                        display: flex;
                        justify-content: center;
                        margin-top: 20px;
                    }
                    .pagination a {
                        margin: 0 5px;
                        padding: 8px 12px;
                        background: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .pagination a.disabled {
                        background: #ccc;
                        pointer-events: none;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Expense List</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                    <div class="pagination">
                        <a href="/added?page=${page - 1}" class="${page <= 1 ? 'disabled' : ''}">Previous</a>
                        <a href="/added?page=${page + 1}" class="${page >= totalPages ? 'disabled' : ''}">Next</a>
                    </div>
                    <div class="buttons">
                        <a href="/expense" class="btn add-btn">Add More Expenses</a>
                        <a href="/login" class="btn logout-btn">Logout</a>
                    </div>
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
