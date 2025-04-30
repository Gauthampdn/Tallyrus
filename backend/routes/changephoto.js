const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' }); // o usar Cloudinary

router.post("/upload-profile-image", upload.single("profileImage"), async (req, res) => {
  const userId = req.user._id;

  const imageUrl = `/uploads/${req.file.filename}`; // o Cloudinary URL

  const perfil = await Perfil.findOneAndUpdate(
    { userId },
    { imageUrl },
    { upsert: true, new: true }
  );

  res.json({ imageUrl });
});
