const nodemailer = require('nodemailer');

const transporters = nodemailer.createTransport({
    tls: 'yes',
    host: 'email-smtp.us-west-2.amazonaws.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.AmazonEmailUser,
        pass: process.env.AmazonPasswordUser // generated ethereal password
    }
});

const dataObject = {
    from: '"Ecommerce Bot" <vishal.provis@gmail.com>', // sender address
    //   to: "joshi.vishal859@gmail.com", // list of receivers
    subject: 'Ticket Detail', // Subject line
    text: `` // plain text body
};

module.exports.mail = transporters;
module.exports.message = dataObject;
