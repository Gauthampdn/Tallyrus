const express = require('express');
const router = express.Router();
const { updateProfile, getProfile } = require('../controllers/profileController');

router.post('/update', updateProfile);
router.get('/', getProfile); // 👈 nueva ruta


const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth); // protege todas las rutas de este archivo


module.exports = router;
