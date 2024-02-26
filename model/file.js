const mongoose = require('mongoose');

// Schema for the parent document
const parentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  author: { type: String, required: true },
  contentType: { type: String, required: true },
});

// Schema for the chunk document
const chunkSchema = new mongoose.Schema({
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
  index: { type: Number, required: true },
  data: { type: Buffer, required: true },
});

const Parent = mongoose.model('Parent', parentSchema);
const Chunk = mongoose.model('Chunk', chunkSchema);

module.exports = { Parent, Chunk };




// const mongoose = require('mongoose');

// // const fileSchema = new mongoose.Schema({
// //   author: { type: String, required: true },
// //   filename: { type: String, required: true },
// //   binaryData: { type: Buffer, required: true },
// //   contentType: { type: String, required: true },
// //   extension: { type: String, required: true }
// // });

// const fileSchema = new mongoose.Schema({
//     author: { type: String, required: true },
//     filename: { type: String, required: true },
//     binaryData: [{ type: Buffer, required: true }], // Change type to array of Buffers
//     contentType: { type: String, required: true },
//     extension: { type: String, required: true }
// });

// const File = mongoose.model('muse_video', fileSchema);

// module.exports = File;
