
const express = require('express');
const router = express.Router();

const {
    uploadFile,
    listFiles,
    downloadFile,
    deleteFile,
    uploadTeacherFile,
    upload,
    uploadRubric
} = require('../controllers/filesController');


const requireAuth = require("../middleware/requireAuth")

router.use(requireAuth) // requires authentication and then calls next. if no authentication then it throws an error


// Define routes
// In your routes file
router.post('/upload/:id', upload.single('file'), uploadFile);
router.post('/upload-teacher/:id', upload.array('files'), uploadTeacherFile); // Add this line for the new route
router.get('/list', listFiles);
router.get('/download/:filename', downloadFile);
router.delete('/delete/:filename', deleteFile);
router.post('/upload-rubric/:id', upload.single('file'), uploadRubric);


module.exports = router;
