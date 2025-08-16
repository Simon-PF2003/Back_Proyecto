const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.ENTERPRISE_MAIL, 
    pass: process.env.ENTERPRISE_PASS
  }
});

module.exports = transporter;