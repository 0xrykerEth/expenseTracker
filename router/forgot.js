const express = require('express');
const path = require('path')
const SibApiV3Sdk = require('sib-api-v3-sdk');
const app = express();
const router = express.Router();

//const text = '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'

const apiKey =  SibApiV3Sdk.ApiClient.instance.authentications['api-key'];
//apiKey.apiKey =


router.get('/forgot',(req,res) => {
    res.sendFile(path.join(__dirname,'../','views','forgot.html'))
})

router.post('/forgot', async(req,res) => {
   try{
    const email = req.body.email;

    if (!email) {
        return res.status(400).send('Email is required');
    }

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = "Welcome to Our Service!";
        sendSmtpEmail.htmlContent = "<h1>This is a test forgot password assignment!</h1><p>We appreciate you.</p>";
        sendSmtpEmail.sender = { name: "Test Ventures", email: "rykerraj090@gmail.com" };
        sendSmtpEmail.to = [{ email: email }];

        await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(email);
    res.send(`Email sent successfully to ${email}`);
   }catch(error){
    console.log(error);
    res.sendStatus(404).send(`<h1>Sending Email to ${email} failed</h1>`);
   }
})


module.exports = router;