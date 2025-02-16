const express = require('express');
const router = express.Router();
const {Spending} = require('../models/data');
const auth = require('../utils/auth'); 


router.get('/added', auth, async (req, res) => {
    try {
        // Only fetch expenses belonging to the logged-in user
        const expenses = await Spending.findAll({
            where: { userId: req.user.id }
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

router.post('/expense/delete', auth, async (req, res) => {
    try {
        const { id } = req.body;
        
        // First find the expense
        const expense = await Spending.findOne({ 
            where: { 
                id: id,
            }
        });

        // Check if expense exists
        if (!expense) {
            return res.status(404).send(`
                <script>
                    alert('Expense not found');
                    window.location.href = '/added';
                </script>
            `);
        }

        // Check if the expense belongs to the logged-in user
        if (expense.userId !== req.user.id) {
            return res.status(403).send(`
                <script>
                    alert('You are not authorized to delete this expense');
                    window.location.href = '/added';
                </script>
            `);
        }

        // If all checks pass, delete the expense
        await Spending.destroy({ 
            where: { 
                id: id,
                userId: req.user.id 
            } 
        });
        
        return res.redirect('/added');
    } catch (error) {
        console.log(error);
        return res.status(500).send(`<h1>Error deleting expense</h1>`);
    }
});

// router.post('/expense/delete', auth, async (req, res) => {
//     try {
//         const { id } = req.body;
//         console.log(id);
//         const expense = await Spending.findOne({ where: { id } });

//         if (!expense) {
//             return res.status(404).send('<h1>Expense not found</h1>');
//         }

//         if (expense.userId !== req.user.id) {
//             return res.send(`
//                 <script>
//                     alert('Unauthorized to delete this expense');
//                     window.location.href = '/added';
//                 </script>
//             `);
//         }

//         await expense.destroy();

//         res.redirect('/added');
//     } catch (error) {
//         console.log(error);
//         res.status(500).send('<h1>Error deleting expense</h1>');
//     }
// });

module.exports = router;