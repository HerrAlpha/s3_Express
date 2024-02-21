const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  author: { type: String, required: true },
  filename: { type: String, required: true },
  binaryData: { type: Buffer, required: true },
});

const File = mongoose.model('muse_video', fileSchema);

module.exports = File;
