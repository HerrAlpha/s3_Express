const express = require('express');
const multer = require('multer');
const { uploadFile, downloadFile } = require('../controller/store-file/file-controller');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define routes
router.post('/upload', upload.single('file'), uploadFile);

// Serve static HTML file for root URL
router.get('/', (req, res) => {
  res.sendFile('view.html', { root: 'views' });
});

router.get('/download/:fileId', downloadFile);

module.exports = router;
