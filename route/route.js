const express = require('express');
const multer = require('multer');
const { uploadFile, downloadFile, deleteFile, createOneTimeToken, downloadFileV2, deleteToken } = require('../controller/store-file/file-controller');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { login, register, logout } = require('../controller/authentication/auth-controller')

// Define routes
router.post('/upload', upload.single('file'), uploadFile);

// Serve static HTML file for root URL
router.get('/', (req, res) => {
  res.sendFile('view.html', { root: 'views' });
});

// router.get('/download/:fileId', downloadFile);
router.get('/download/:token/:tokenId', downloadFileV2);
router.post('/create-token', createOneTimeToken);
router.post('/delete', deleteFile);
router.post('/delete-token', deleteToken);

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

module.exports = router;
