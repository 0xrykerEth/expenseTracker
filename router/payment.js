const express = require('express');
const router = express.Router();

router.get('/payment', (req, res) => {
    const { session_id } = req.query;

    if (!session_id) {
        return res.status(400).json({ error: 'Session ID is missing' });
    }

    const html = `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cashfree Checkout Integration</title>
                <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
            </head>
            <body>
                <div class="row">
                    <p>Click below to open the checkout page in the current tab</p>
                    <button id="renderBtn">Pay Now</button>
                </div>
                <script>
                    const cashfree = Cashfree({
                        mode: "sandbox",
                    });
                    document.getElementById("renderBtn").addEventListener("click", () => {
                        let checkoutOptions = {
                            paymentSessionId: "${session_id}",
                            redirectTarget: "_self",
                        };
                        cashfree.checkout(checkoutOptions);
                    });
                </script>
            </body>
        </html>
    `;
    res.send(html);
});


module.exports = router;
