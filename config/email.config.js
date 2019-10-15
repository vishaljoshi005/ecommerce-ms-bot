const nodemailer = require('nodemailer');

const transporters = nodemailer.createTransport({
    tls: 'yes',
    host: 'email-smtp.us-west-2.amazonaws.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.AmazonEmailUser,
        pass: process.env.AmazonPasswordUser
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
