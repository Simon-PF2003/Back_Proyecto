const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Bill = require('../models/bill')
const path = require('path');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const carpetaRelativa = '';
const rutaAbsoluta = path.resolve(carpetaRelativa);
const transporter = require('../utils/mail');

//POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST 
  //Agrega al usuario de forma manual
async function addUser(req, res) {
  const { email, password, businessName, cuit, phoneNumber, address, status, role } = req.body;
  
  let profileImage = null;
  if (req.file) {
    profileImage = req.file.filename;
  }
  

  /*console.log('agregando usuario');
  console.log('usuario:', req.body);
  console.log('imagen:', req.file);*/

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Email inválido' });
  }

  try {
    const existingUserEmail = await User.findOne({ email });
    const existingUserCuit = await User.findOne({ cuit });

    if (existingUserEmail) {
      return res.status(400).json({ message: 'Email ya registrado' });
    }
    
    if (existingUserCuit) {
      return res.status(400).json({ message: 'CUIT ya registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      businessName,
      cuit,
      phoneNumber,
      address,
      status,
      role,
      accepted: true,
      profileImage: profileImage ? 'uploadsProfileImages/' + profileImage : null,
      verificationCode: null,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, profileImage: newUser.profileImage }, 'secretKey');
    res.status(200).json({ token });

  } catch (error) {
    console.error(error, error.stack);
    res.status(500).json({ message: 'Error al agregar el usuario.' });
  }
}

  //Manda el codigo para recuperar la contraseña
async function sendCode(req,res) {
  const { email, code } = req.body;
   try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }
    user.verificationCode = code;
    await user.save();

    const opcionesCorreo = {
      from: process.env.ENTERPRISE_MAIL,
      to: email,
      subject: 'Código de verificación',
      text: `Tu código de verificación es: ${code}`,
    };

    if (!validator.isEmail(email)) {
      return res.status(401).send('Correo electrónico no válido');
    }

    transporter.sendMail(opcionesCorreo, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo electrónico:', error);
        res.status(500).json({ mensaje: 'Error al enviar el correo electrónico' });
      } else {
        console.log('Correo electrónico enviado:', info.response);
        res.status(200).json({ mensaje: 'Correo electrónico enviado correctamente' });
      }
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ mensaje: 'Error al procesar la solicitud.' });
  }
}

  //Compara el codigo de verificacion para reestablecer la contraseña
async function compareCode(req,res) {
  const { email, code } = req.body;

  try {
    // Buscar el usuario por correo electrónico
    const user = await User.findOne({ email });
    if (user && user.verificationCode === code) {
      user.verificationCode = null;
      return res.status(200).json({ message: 'Código verificado exitosamente.' });
    } else {
      return res.status(400).json({ message: 'Código incorrecto.' });
    }
  } catch (error) {
    console.error('Error al verificar el código y restablecer la contraseña:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
}

async function signUp(req,res) {
  const role = 'Usuario Comun';
  const { email, businessName, cuit, phoneNumber, address, profileImage} = req.body;

  if (!validator.isEmail(email)) {
    return res.status(400).send('Correo electrónico no válido');
  }

  /*if (password.length < 8 || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)) {
    return res.status(400).send('La contraseña debe tener al menos 8 caracteres de longitud y contener al menos un carácter especial');
  }*/

  try {
    const existingUserEmail = await User.findOne({ email });
    const existingUserCuit = await User.findOne({ cuit });

    if (existingUserEmail) {
      return res.status(400).send("Mail Existente");
    }

    if (existingUserCuit) {
      return res.status(400).send("CUIT Existente");
    }

    /*const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);*/

    const newUser = new User({
      email,
       //hashedPassword,
      businessName,
      cuit,
      phoneNumber,
      address,
      status: 'Al día',
      profileImage,
      role,
      accepted: false,
    });

    newUser.profileImage = profileImage;

    await newUser.save();

    const token = jwt.sign({ _id: newUser._id, profileImage: newUser.profileImage }, 'secretKey');

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al crear cuenta");
  }
}

async function login(req,res)  {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user.accepted === false) {
      return res.status(402).send("Usuario pendiente de aceptación");
    }
    else if (user.accepted === null) {
      return res.status(405).send("No cumple con las condiciones para ser cliente");
    }
    else { 
        if (!email || !password) {
        return res.status(400).send("Faltan credenciales");
      }
  
      if (!user) {
        return res.status(401).send("Credenciales inválidas");
      }
  
      if (password) 
        {const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
            return res.status(401).send("Credenciales inválidas");
          }
        }
  
      /*if (!passwordMatch) {
        return res.status(401).send("Credenciales inválidas");
      }*/
    }
    updateUserDiscount(user);
    const token = jwt.sign({ _id: user._id, role: user.role }, 'secretKey');
    res.status(200).json({ token });
    console.log(user.role);
  } catch (error) {
    console.error("Error en la autenticación:", error);
    res.status(500).send("Error en la autenticación");
  }
}

  //Funcion privada a la hora de realizar login
async function updateUserDiscount(user) {
  try {
    const now = new Date();
    const userCreatedAt = new Date(user.createdAt);
    const userAgeInYears = (now - userCreatedAt) / (1000 * 60 * 60 * 24 * 365); // Convertir ms a años

    // Verificar si los descuentos ya existen
    const discount0 = await Discount.findOne({ discountPercentage: 0 });
    const discount5 = await Discount.findOne({ discountPercentage: 0.05 });
    const discount10 = await Discount.findOne({ discountPercentage: 0.1 });

    // Crear los descuentos si no existen
    let discount0Id = discount0 ? discount0._id : null;
    let discount5Id = discount5 ? discount5._id : null;
    let discount10Id = discount10 ? discount10._id : null;

    if (!discount0Id) {
      const newDiscount0 = await Discount.create({ discountPercentage: 0, daysFrom: 0, daysUntil: 365 });
      discount0Id = newDiscount0._id;
    }

    if (!discount5Id) {
      const newDiscount5 = await Discount.create({ discountPercentage: 0.05, daysFrom: 365, daysUntil: 3650 });
      discount5Id = newDiscount5._id;
    }

    if (!discount10Id) {
      const newDiscount10 = await Discount.create({ discountPercentage: 0.1, daysFrom: 3650, daysUntil: null });
      discount10Id = newDiscount10._id;
    }

    // Determinar qué descuento asignar
    let assignedDiscount = null;
    if (userAgeInYears >= 1 && userAgeInYears < 10) {
      assignedDiscount = discount5Id;
    } else if (userAgeInYears >= 10) {
      assignedDiscount = discount10Id;
    } else {
      assignedDiscount = discount0Id;
    }

    // Actualizar el usuario solo si hay un cambio
    if (user.discountId?.toString() !== assignedDiscount?.toString()) {
      user.discountId = assignedDiscount;
      console.log(`Descuento asignado al usuario ${user._id}: ${assignedDiscount}`);
      await user.save();
    }

  } catch (error) {
    console.error("Error actualizando descuento del usuario:", error);
  }
}

//GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET 
  //Devuelve usuarios que no fueron aceptados
async function getPendingUsers(req, res) {
  try {
    console.log('buscando usuarios pendientes');
    const pendingUsers = await User.find({ accepted: 'false' });
    res.json(pendingUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de usuarios pendientes.' });
  }
}

  //Devuelve a todos los usuarios para alta o eliminacion
async function getAllUsers(req, res) {
  try {
    console.log('buscando todos los usuarios');
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de usuarios.' });
  }
}

  //Filtros para el reporte
async function filterUsers(req,res) {
  try {
    const { criteria, startDate, endDate, sortOrder } = req.query;
    let clients;

    // Obtener fechas de última venta para todos los clientes
    /*const orders = await Order.aggregate([
      {
        $group: {
          _id: '$userId',
          lastOrderDate: { $max: '$createdAt' }
        }
      }
    ]);

    const lastOrderMap = orders.reduce((map, order) => {
      map[order._id.toString()] = order.lastOrderDate;
      return map;
    }, {});*/

    const bills = await Bill.aggregate([
      {
        $group: {
          _id: '$userId',
          lastOrderDate: { $max: '$createdAt' }
        }
      }
    ]);

    const lastOrderMap = bills.reduce((map, bill) => {
      map[bill._id.toString()] = bill.lastOrderDate;
      return map;
    }, {});

    if (criteria === 'antiguedad') {
      const filter = {};
      if (startDate && endDate) {
        filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      clients = await User.find(filter).sort({
        createdAt: sortOrder === 'asc' ? 1 : -1
      });

      // Agregar la fecha de última venta a cada cliente
      clients = clients.map(client => {
        const lastOrderDate = lastOrderMap[client._id.toString()] || null;
        return {
          ...client.toObject(),
          lastOrderDate
        };
      });

    } else if (criteria === 'ultimaVenta') {
      clients = await User.find();

      // Agregar la fecha de última venta y filtrar por rango si aplica
      clients = clients.map(client => {
        const lastOrderDate = lastOrderMap[client._id.toString()] || null;
        return {
          ...client.toObject(),
          lastOrderDate
        };
      });

      if (startDate && endDate) {
        clients = clients.filter(client => {
          const lastOrderDate = client.lastOrderDate;
          return lastOrderDate && lastOrderDate >= new Date(startDate) && lastOrderDate <= new Date(endDate);
        });
      }

      // Ordenar por fecha de última venta
      clients.sort((a, b) => {
        const dateA = a.lastOrderDate || new Date(0);
        const dateB = b.lastOrderDate || new Date(0);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    res.json(clients);
  } catch (error) {
    console.error('Error al filtrar los clientes:', error);
    res.status(500).send('Error interno del servidor');
  }
}

async function searchUser(req,res) {
  const searchTerm = req.params.query;
  try {
    const isNumeric = !isNaN(Number(searchTerm));
    console.log(isNumeric);
    if (isNumeric) {
    // Búsqueda por cuit
    cliente = await User.findOne({ cuit: searchTerm }).exec();
      if (!cliente || cliente.length === 0) {
      return res.status(404).json({ mensaje: 'Clientes no encontrados' });
    }   
    console.log(cliente)
    return res.status(200).json(cliente);
  } else {
    // Búsqueda por businessName
    clientes = await User.find({ businessName: { $regex: searchTerm, $options: 'i'}}).exec();
      if (!clientes || clientes.length === 0) {
      return res.status(404).json({ mensaje: 'Clientes no encontrados' });
    }   
    return res.status(200).json(clientes);
    }  
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al buscar el cliente', error: error });
  }
}

//Busqueda por mail del cliente al dar de alta
async function getUserEmail(req,res) {
        const mail = req.params.email;
        console.log('entramos');
        console.log(mail);
  try {
    //busqueda por mail
    clientes = await User.find({ email: mail }).exec();
      if (!clientes || clientes.length === 0) {
      console.log('No encontramos nada');
      return res.status(404).json({ mensaje: 'Clientes no encontrados' });
    }
    console.log(clientes);   
    return res.status(200).json(clientes);
    }  
   catch (error) {
    return res.status(500).json({ mensaje: 'Error al buscar el cliente', error: error });
   }
}

  //Imagen de mi perfil
async function getUserImage(req,res)  {    
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.profileImage) {
      const imagePath = path.join(rutaAbsoluta, user.profileImage);
      res.status(200).sendFile(imagePath);
    } else {
      return res.status(404).json({ message: 'Imagen de perfil no encontrada para el usuario' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la imagen del usuario' });
  }
}

  //sirve para todo mas o menos. Para mi perfil, verificar permisos y accesos, etc
async function getUser(req,res) {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userData = {
      id:user._id,
      email: user.email,
      businessName: user.businessName,
      cuit: user.cuit,
      phoneNumber: user.phoneNumber,
      address: user.address,
      profileImage: user.profileImage,
      status: user.status,
      discount: user.discountId,
    };
    console.log(userData);
    res.status(200).json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los datos del usuario' });
  }
}

async function getUserById(req,res) {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(404).send("Cliente no existe");

  const userDetails = {
    _id: user._id,
    email: user.email,
    businessName : user.businessName,
  };
  console.log(userDetails);
  res.json(userDetails);
}

async function getUserDiscount(req,res) {
  try {
    const userId = req.params.user;
    console.log('id usuario', userId);
    const user = await User.findById(userId).populate('discountId');
    
    if (!user || !user.discountId) {
      return res.json({ discountPercentage: 0 });
    }
    
    res.json({ discountPercentage: user.discountId.discountPercentage });
  } catch (error) {
    console.error("Error obteniendo el descuento del usuario:", error);
    res.status(500).json({ error: "Error obteniendo el descuento" });
  }
}

//PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH 
async function editUser(req, res) {
  const { id } = req.params;
  const { email, businessName, cuit, phoneNumber, address, status, role, accepted } = req.body;
  const updateOps = { email, businessName, cuit, phoneNumber, address, status, role, accepted };

  if (req.file) {
    const profileImage = req.file.filename;
    updateOps.profileImage = 'uploadsProfileImages/' + profileImage;
  }
  try {
    const user = await User.findByIdAndUpdate(id, updateOps, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al editar el usuario.' });
  }
};

async function acceptUser(req,res) {
  const { email } = req.params;
  const { password } = req.body;
  console.log('aceptando');
  console.log(password);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.accepted = true;

    await user.save();

    const opcionesCorreo = {
      from:process.env.ENTERPRISE_MAIL,
      to: email,
      subject: 'MPS SQUARE - Aceptación de usuario',
      text: `Bienvenido a MPS SQUARE. Tu cuenta ha sido aceptada. Puedes iniciar sesión con tu correo electrónico y la contraseña: ${password}. Puede modificar su contraseña desde la sección "¿Olvidaste tu contraseña?" del login si asi lo desea.`,
    };

    if (!validator.isEmail(email)) {
      return res.status(401).send('Correo electrónico no válido');
    }

    transporter.sendMail(opcionesCorreo, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo electrónico:', error);
        res.status(500).json({ mensaje: 'Error al enviar el correo electrónico' });
      } else {
        console.log('Correo electrónico enviado:', info.response);
        res.status(200).json({ mensaje: 'Correo electrónico enviado correctamente' });
      }
    });

    res.json({ message: 'Usuario aceptado correctamente y correo enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al aceptar el usuario' });
  }
}

async function rejectUser(req,res) {
  {
    const { email } = req.params;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const opcionesCorreo = {
        from: process.env.ENTERPRISE_MAIL,
        to: email,
        subject: 'MPS SQUARE - Solicitud rechazada',
        text: `Lamentablemente, tu solicitud ha sido rechazada. Si tienes alguna pregunta, por favor contáctanos.`,
      };
  
      if (!validator.isEmail(email)) {
        return res.status(401).send('Correo electrónico no válido');
      }
  
      transporter.sendMail(opcionesCorreo, (error, info) => {
        if (error) {
          console.error('Error al enviar el correo electrónico:', error);
          res.status(500).json({ mensaje: 'Error al enviar el correo electrónico' });
        } else {
          console.log('Correo electrónico enviado:', info.response);
          res.status(200).json({ mensaje: 'Correo electrónico enviado correctamente' });
        }
      });
    user.accepted = null;
    await user.save();
    res.status(200).json({ message: 'Usuario rechazado correctamente y correo enviado' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al rechazar el usuario' });
    }
  }
}

async function assignPrivileges(req,res) {
  const userId = req.params.userId;
  const { role } = req.body;
  const updateOps = {role}

  try {
    const result = await User.findByIdAndUpdate( userId, updateOps );

    if (!result) {
      return res.status(404).json({ error: 'User no encontrado' });
    }

    res.json({message:"Privilegios asignados correctamente"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar privilegios' });
  }
}

async function modifyStatus(req,res) {
  const { userId } = req.params;
  const { status } = req.body;

  User.findByIdAndUpdate(userId, { status }, { new: true }).then (user => {
    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.json(user);
  }).catch(error => {
    console.error(error);
    res.status(500).send('Error al modificar el estado del usuario');
  });
}

async function newPassword(req,res) {
  const { email, password } = req.body;

  try {
    const client = await User.findOne({ email }).exec();

    if (!client) {
      console.log('No se encontró ningún cliente');
      return res.status(404).json({ mensaje: 'Clientes no encontrados' });
    } else {

       if (password.length < 8 || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)) {
    return res.status(400).send('La contraseña debe tener al menos 8 caracteres de longitud y contener al menos un carácter especial');
  }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      client.password = hashedPassword;
      await client.save();
      res.status(200).json({ mensaje: 'Contraseña modificada correctamente' });
    }
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    return res.status(500).json({ mensaje: 'Error al cambiar la contraseña', error: error });
  }
}

//DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE 
async function deleteUser(req,res) {
  const userId = req.params.userId;
  console.log(userId);
  try {
    const deletedUser = await User.findByIdAndDelete(userId);  

    if (!deletedUser) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
}

module.exports = {
  //POST
  addUser, 
  sendCode,
  compareCode,
  signUp,
  login,

  //GET
  getAllUsers,
  getPendingUsers,
  filterUsers,
  searchUser,
  getUserEmail,
  getUserImage,
  getUser,
  getUserById,
  getUserDiscount,

  //PATCH
  editUser,
  acceptUser,
  rejectUser,
  assignPrivileges,
  modifyStatus,
  newPassword,

  //DELETE
  deleteUser  
}