const { Parent, Chunk } = require('../../model/file');
const { Readable } = require('stream');
const { get200, delete200, get404, post201, get422, get401 } = require('../../library/response-library');
const { post } = require('../../route/route');
const { encrypt, decrypt } = require('../../security/encryption');
const { text } = require('express');
const { checkTokenWithAuthorizationUser } = require('../../security/token-checking');

const uploadFile = async (req, res) => {

  if (checkTokenWithAuthorizationUser(req.body.author, req, res) === false) {
    return res.status(401).send(get401());
  }

  console.log('Preparing to upload file...')
  try {
    const { author } = req.body;
    const { originalname, buffer, mimetype } = req.file;

    // Create parent document to store metadata
    const parent = new Parent({
      filename: originalname,
      author,
      contentType: mimetype,
    });

    await parent.save();

    // Set chunk size to 12MB
    const chunkSize = 15 * 1024 * 1024; // 12MB in bytes

    // Calculate the number of chunks
    const numChunks = Math.ceil(buffer.length / chunkSize);

    console.log('Starting to upload file...')

    // Upload each chunk
    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize, buffer.length);
      const chunkData = buffer.slice(start, end);

      // Create chunk document and associate with parent
      const chunk = new Chunk({
        parentId: parent._id,
        index: i,
        data: chunkData,
      });
      await chunk.save();

      // Calculate upload percentage
      const uploadPercentage = Math.round(((i + 1) / numChunks) * 100);

      uploadPrecentageNotif(uploadPercentage);
    }

    console.log('File upload complete')

    // const text = String(parent._id);
    // encrypta = encrypt(text, author);
    // decrypta = decrypt(encrypta, author);

    // console.log('Encrypted:', encrypta);
    // console.log('Decrypted:', decrypta);

    // Send the response after the upload is complete
    res.status(201).send(post201(parent._id));
  } catch (error) {
    console.error('Failed to upload file:', error);
    res.status(422).send(get422());
  }
};

const uploadPrecentageNotif = (uploadPercentage) => {
  console.log(`Uploaded ${uploadPercentage}%`);
}
const downloadFile = async (req, res) => {
  try {
    const {author} = req.body;
    console.log('Author:', author);

    // Check if authorization token exists
    const authorizationToken = await req.headers['authorization'];
    if (!authorizationToken) {
      return res.status(401).send(get401());
    }

    // Validate authorization token
    if (checkTokenWithAuthorizationUser(author, req, res) == false){
      console.log('Token validation failed');
      return res.status(401).send(get401());
    }

    const { fileId } = req.params;

    // Find the parent document
    const parent = await Parent.findById(fileId);
    if (!parent) {
      console.log('File not found:', fileId);
      return res.status(404).send('File not found');
    }

    // Set Content-Type header based on the file's contentType
    res.set('Content-Type', parent.contentType);

    // Fetch all chunks associated with the parent document in parallel
    const chunksPromise = Chunk.find({ parentId: parent._id }).sort({ index: 1 });
    const chunks = await chunksPromise;

    // Calculate total file size
    const totalFileSize = chunks.reduce((acc, chunk) => acc + chunk.data.length, 0);

    // Set Content-Range header to inform client about the range being sent
    res.setHeader('Content-Range', `bytes 0-${totalFileSize - 1}/${totalFileSize}`);
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Set Content-Length header to the length of the concatenated data
    res.setHeader('Content-Length', totalFileSize);

    // Stream the data to the client
    const readableStream = new Readable();

    // Push initial chunks to the stream
    for (const chunk of chunks) {
      readableStream.push(chunk.data);
    }

    // Signal the end of the stream
    readableStream.push(null);

    // Pipe the stream to the response object
    readableStream.pipe(res);

  } catch (error) {
    console.error('Failed to download file:', error);
    res.status(500).send('Failed to download file');
  }
};


module.exports = { uploadFile, downloadFile };




// const fs = require('fs');
// const mongoose = require('mongoose');
// const File = require('../../model/file');

// const uploadFile = async (req, res) => {
//   try {
//     const { author } = req.body;
//     const { originalname, buffer, mimetype } = req.file;

//     // Determine file extension
//     const extension = originalname.split('.').pop();

//     // Calculate chunk size dynamically based on buffer length
//     const maxChunkSize = 1024 * 1024; // 1MB
//     const numChunks = Math.ceil(buffer.length / maxChunkSize);
//     const chunks = [];
//     let start = 0;

//     for (let i = 0; i < numChunks; i++) {
//       const end = Math.min(start + maxChunkSize, buffer.length);
//       const chunk = buffer.slice(start, end);
//       chunks.push(chunk);
//       start += maxChunkSize;
//     }

//     // Create a new File document to store metadata and binary data chunks
//     const newFile = new File({
//       author,
//       filename: originalname,
//       binaryData: chunks,
//       contentType: mimetype,
//       extension,
//     });

//     // Save the File document
//     await newFile.save();

//     res.send('File uploaded successfully');
//   } catch (error) {
//     console.error('Failed to upload file:', error);
//     res.status(500).send('Failed to upload file');
//   }
// };


// const downloadFile = async (req, res) => {
//   try {
//     const { fileId } = req.params;

//     // Find the File document by _id
//     const file = await File.findById(fileId);

//     if (!file) {
//       console.log('File not found:', fileId);
//       return res.status(404).send('File not found');
//     }

//     // Reassemble binaryData from chunks
//     const binaryData = Buffer.concat(file.binaryData);

//     // Set Content-Type header based on the file's contentType
//     res.set('Content-Type', file.contentType);

//     // Send the file data as response
//     res.send(binaryData);
//   } catch (error) {
//     console.error('Failed to download file:', error);
//     res.status(500).send('Failed to download file: ' + error.message);
//   }
// };

// module.exports = { uploadFile, downloadFile };





// // const fs = require('fs');
// // const mongoose = require('mongoose');
// // const File = require('../../model/file');

// // const uploadFile = async (req, res) => {
// //   try {
// //     const { author } = req.body;
// //     const { originalname, buffer, mimetype } = req.file;

// //     // Determine file extension
// //     const extension = originalname.split('.').pop();

// //     // Create a new File document to store metadata and binary data
// //     const newFile = new File({
// //       author,
// //       filename: originalname,
// //       binaryData: buffer,
// //       contentType: mimetype,
// //       extension,
// //     });

// //     // Save the File document
// //     await newFile.save();

// //     res.send('File uploaded successfully');
// //   } catch (error) {
// //     console.error('Failed to upload file:', error);
// //     res.status(500).send('Failed to upload file');
// //   }
// // };

// // const downloadFile = async (req, res) => {
// //   try {
// //     const { fileId } = req.params;

// //     // Find the File document by _id
// //     const file = await File.findById(fileId);

// //     if (!file) {
// //       console.log('File not found:', fileId);
// //       return res.status(404).send('File not found');
// //     }

// //     // Set Content-Type header based on the file's contentType
// //     res.set('Content-Type', file.contentType);

// //     // Send the file data as response
// //     res.send(file.binaryData);
// //   } catch (error) {
// //     console.error('Failed to download file:', error);
// //     res.status(500).send('Failed to download file: ' + error.message);
// //   }
// // };


// // module.exports = { uploadFile, downloadFile };
