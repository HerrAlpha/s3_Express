const fs = require('fs');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const File = require('../../model/file');

// Initialize GridFS
let gfs;
mongoose.connection.once('open', () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection('uploads');
});

const uploadFile = async (req, res) => {
  try {
    const { author } = req.body;
    const { originalname, buffer } = req.file;

    // Create a writable stream
    const writestream = gfs.createWriteStream({
      filename: originalname,
      metadata: { author },
    });

    // Pipe the buffer to the writable stream
    writestream.write(buffer);

    // When the stream finishes writing
    writestream.on('close', async (file) => {
      // Create a new File document to store metadata
      const newFile = new File({
        author,
        filename: file.filename,
        fileId: file._id,
      });

      // Save the File document
      await newFile.save();

      res.send('File uploaded successfully');
    });

    // End the writable stream
    writestream.end();
  } catch (error) {
    console.error('Failed to upload file:', error);
    res.status(500).send('Failed to upload file');
  }
};

module.exports = { uploadFile };
