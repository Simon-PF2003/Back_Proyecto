const User = require('../models/user');

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