const validator = require('validator');
const transporter = require('../utils/mail');

async function sendEmail(req,res) {
  const { name, email, message } = req.body;

  const opcionesCorreo = {
    from: name, 
    to: process.env.ENTERPRISE_MAIL,
    subject:  email,
    text: message
  };
      if (!validator.isEmail(email)) { return res.status(401).send('Correo electrónico no válido');}
      if (!validator.isAlpha(name.replace(/ /g, ''))) { return res.status(401).send('Nombre no válido');}
      if(message.length > 500){ return res.status(401).send('El mensaje no puede superar los 500 caractéres')}

  transporter.sendMail(opcionesCorreo, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo electrónico:', error);
      res.status(500).json({ mensaje: 'Error al enviar el correo electrónico' });
    } else {
      console.log('Correo electrónico enviado:', info.response);
      res.status(200).json({ mensaje: 'Correo electrónico enviado correctamente' });
    }
  });
}

module.exports = {
  sendEmail
}