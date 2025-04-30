
const User = require('../models/userModel');


const updateProfile = async (req, res) => {
    try {
      console.log("req.user:", req.user); // 👈 Añade esto
  
      const { dateOfBirth } = req.body;
      const userId = req.user._id;
  
      const user = await User.findById(userId);
      user.dateOfBirth = new Date(dateOfBirth);
      await user.save();
  
      res.status(200).json({ message: 'Profile updated' });
    } catch (error) {
      console.error(error); // 👈 también imprime errores
      res.status(500).json({ error: 'Failed to update profile' });
    }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name surname email dateOfBirth image');
    res.status(200).json({
      name: user.name,
      surname: user.surname,
      email: user.email,
      image: user.image,
      dateOfBirth: user.dateOfBirth,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo obtener el perfil' });
  }
};


module.exports = {
  updateProfile,
  getProfile,
};

  