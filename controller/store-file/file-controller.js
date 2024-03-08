const { Parent, Chunk } = require('../../model/file');
const { Readable } = require('stream');
const { get200, delete200, get404, post201, get422, get401 } = require('../../library/response-library');
const { post } = require('../../route/route');
const { encrypt, decrypt } = require('../../security/encryption');
const { text } = require('express');
const { checkTokenWithAuthorizationUser } = require('../../security/token-checking');
const Validator = require('../../library/validation');
const { warning, basic, style, reset } = require('../../library/console-style');

const uploadFile = async (req, res) => {

  if (checkTokenWithAuthorizationUser(req.body.author, req, res) === false) {
    return get401(res);
  }

  console.log(`${warning.info}  Preparing to upload file...`)
    const { author } = req.body;

    
   const validation = new Validator();


    // FIRST CHECKING VALIDATION
    validation.validate({
      author: author,
      file: req.file,
    }, {
      author: 'required|string',
      file: 'required|file'
    }, res);
      
    if (validation.statusValidation === false) {
      return get422(res, validation.errorInfo); // Return 422 if validation fails
    }
    const { originalname, buffer, mimetype } = req.file;

    console.log(`${warning.info}  mimetype: ${mimetype}`)

    // SECOND CHECKING VALIDATION
    validation.validate({
      author: author,
      file: req.file,
      originalname: originalname,
      buffer: buffer,
      mimetype: mimetype
    }, {
      author: 'required|string',
      file: 'required|file',
      originalname: 'required|string',
      buffer: 'required|file_size:500MB',
      mimetype: 'required|file_extension:video/mp4,image/jpg,image/jpeg,image/png,application/zip'
    }, res);
      
    if (validation.statusValidation === false) {
      console.log(`${warning.warn}   Validation failed`);
      return get422(res, validation.errorInfo); // Return 422 if validation fails
    }

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

    console.log(`${warning.info}  Starting to upload file...`)

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

    console.log(`${warning.good}   File upload complete`)

    // const text = String(parent._id);
    // encrypta = encrypt(text, author);
    // decrypta = decrypt(encrypta, author);

    // console.log('Encrypted:', encrypta);
    // console.log('Decrypted:', decrypta);

    // Send the response after the upload is complete
    return post201(res, parent._id);
};

const uploadPrecentageNotif = (uploadPercentage) => {
  console.log(`Uploaded ${uploadPercentage}%......${basic.green}✔${reset}`);
}
const downloadFile = async (req, res) => {
    const {author} = req.body;
    console.log('Author:', author);

    // Check if authorization token exists
    const authorizationToken = await req.headers['authorization'];
    if (!authorizationToken) {
      return get401(res);
    }

    // Validate authorization token
    if (checkTokenWithAuthorizationUser(author, req, res) == false){
      console.log(`${warning.error}   Token validation failed`);
      return get401(res);
    }

    const { fileId } = req.params;

    // Find the parent document
    const parent = await Parent.findById(fileId);
    if (!parent) {
      console.log('File not found:', fileId);
      return get404(res, 'File not found');
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
};

const deleteFile = async (req, res) => {
  const { author, fileId } = req.body;

  const validation = new Validator();

  validation.validate({
    author: author,
    fileId: fileId
  }, {
    author: 'required|string|alpha_num',
    fileId: 'required|string|alpha_num'
  }, res);

  if (validation.statusValidation === false) {
    return get422(res, validation.errorInfo); // Return 422 if validation fails
  }

  // Check if authorization token exists
  if (checkTokenWithAuthorizationUser(author, req, res) === false) {
    return get401(res);
  }

  // Find the parent document
  const parent = await Parent.findById(fileId);
  if (!parent) {
    console.log('File not found:', fileId);
    return get404(res, 'File not found');
  }

  // Delete all chunks associated with the parent document
  const deleteChunksResult = await Chunk.deleteMany({ parentId: parent._id });
  if (deleteChunksResult.deletedCount === 0) {
    console.error('Error deleting chunks');
    return get500(res); // Return 500 Internal Server Error
  }

  // Delete the parent document
  const deleteParentResult = await Parent.findByIdAndDelete(fileId);
  if (!deleteParentResult) {
    console.error('Error deleting file:', fileId);
    return get500(res); // Return 500 Internal Server Error
  }

  return delete200(res);
};



module.exports = { uploadFile, downloadFile, deleteFile };




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
