const { Router } = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { search } = require('../routes/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');



exports.getPendingUsers = async (req, res) => {
  try {
    console.log('buscando usuarios pendientes');
    const pendingUsers = await User.find({ accepted: 'false' });
    res.json(pendingUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de usuarios pendientes.' });
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    console.log('buscando todos los usuarios');
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de usuarios.' });
  }
}

exports.editUser = async (req, res) => {
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

exports.addUser = async (req, res) => {
  const { email, password, businessName, cuit, phoneNumber, address, status, role } = req.body;
  const profileImage = req.file.filename;

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