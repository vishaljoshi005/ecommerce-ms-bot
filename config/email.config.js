const nodemailer = require('nodemailer');

const transporters = nodemailer.createTransport({
    tls: 'yes',
    host: process.env.AzureEmailHost,
    port: 587,
    secure: false,
    auth: {
        user: process.env.AzureEmailKey,
        pass: process.env.AzureEmailSecret
    }
});

const dataObject = {
    from: '"Ecommerce Bot" <vishal.provis@gmail.com>',
    //   to:  // list of receivers
    subject: 'Ticket Detail',
    text: `` // plain text body
};

module.exports.mail = transporters;
module.exports.message = dataObject;
