const express = require('express');
const path = require('path')
const SibApiV3Sdk = require('sib-api-v3-sdk');
const router = express.Router();
const {User,PasswordReset} = require('../models/data');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey =  SibApiV3Sdk.ApiClient.instance.authentications['api-key'];
apiKey.apiKey = process.env.emailKey;


router.get('/forgot',(req,res) => {
    res.sendFile(path.join(__dirname,'../','views','forgot.html'))

})

router.post('/forgot', async (req, res) => {
    try {
        const email = req.body.email;
        
        if (!email || !email.includes('@')) {
            return res.status(400).send(`<h1>Invalid Email</h1>`);
        }

        const user = await User.findOne({ where: { email } });
        console.log(user);

        if (!user) {
            return res.status(400).send(`<h1>User Doesn't Exist</h1>`);
        }

        const resetId = uuidv4();
        await PasswordReset.create({
        id: resetId,
        userId: user.id,
        isActive: true,
        expiresby: new Date(Date.now() + 3600000)
    });

        const resetUrl = `http://localhost:3000/resetpassword/${resetId}`;

        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.sender = { name: "Test Ventures", email: "rykerraj090@gmail.com" };
        sendSmtpEmail.to = [{ email: user.email }];
        sendSmtpEmail.subject = "Password Reset Request";
        sendSmtpEmail.htmlContent = `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`;

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        return res.send(`Email sent successfully to ${email}`);

    } catch (error) {
        console.error("Error sending email:", error.response ? error.response.text : error.message);
        return res.status(500).send(`<h1>Sending reset link to user unsuccessful</h1>`);
    }
});


router.get('/resetpassword/:id', async (req, res) => {
    const { id } = req.params;
    const resetRequest = await PasswordReset.findOne({ where: { id, isActive: true } });

    if (!resetRequest) {
        return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    res.sendFile(path.join(__dirname,'../','views','reset.html'))
});

const bcrypt = require('bcrypt');

router.post('/updatepassword/:id', async (req, res) => {
    try{
    const { id } = req.params;
    const { newPassword } = req.body;

    const resetRequest = await PasswordReset.findOne({ where: { id, isActive: true } });

    if (!resetRequest) {
        return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update({ password: hashedPassword }, { where: { id: resetRequest.userId } });

    await PasswordReset.update({ isActive: false }, { where: { id } });

    res.json({ message: 'Password updated successfully' });
    }catch(error){
        console.log(error);
    }
});



module.exports = router;