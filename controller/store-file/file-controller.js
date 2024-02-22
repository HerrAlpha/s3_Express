const fs = require('fs');
const mongoose = require('mongoose');
const File = require('../../model/file');

const uploadFile = async (req, res) => {
  try {
    const { author } = req.body;
    const { originalname, buffer, mimetype } = req.file;

    // Determine file extension
    const extension = originalname.split('.').pop();

    // Create a new File document to store metadata and binary data
    const newFile = new File({
      author,
      filename: originalname,
      binaryData: buffer,
      contentType: mimetype,
      extension,
    });

    // Save the File document
    await newFile.save();

    res.send('File uploaded successfully');
  } catch (error) {
    console.error('Failed to upload file:', error);
    res.status(500).send('Failed to upload file');
  }
};

const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Find the File document by _id
    const file = await File.findById(fileId);

    if (!file) {
      console.log('File not found:', fileId);
      return res.status(404).send('File not found');
    }

    // Set Content-Type header based on the file's contentType
    res.set('Content-Type', file.contentType);

    // Send the file data as response
    res.send(file.binaryData);
  } catch (error) {
    console.error('Failed to download file:', error);
    res.status(500).send('Failed to download file: ' + error.message);
  }
};


module.exports = { uploadFile, downloadFile };
