const User = require('../models/user');

async function uploadImage(req,res) {
  try {
    const imagePath = req.file.path;
    const userId = req.userId; 

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.profileImage = imagePath;
    await user.save();

    res.json({ imagePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cargar la imagen de perfil' });
  }
}

module.exports = {
  uploadImage
}