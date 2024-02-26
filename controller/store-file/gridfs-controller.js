const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const connectToDatabase = require('../../database/database');
const fs = require('fs');
const path = require('path');

let db;
let gridFSBucket;

connectToDatabase().then(database => {
    db = database;
    gridFSBucket = new GridFSBucket(db);
}).catch(err => {
    console.error('Error connecting to database:', err);
    process.exit(1);
});

const storeFile = async (req, res) => {
    try {
        const { originalname, buffer, mimetype } = req.file;
        const extension = path.extname(originalname);
        const uploadStream = gridFSBucket.openUploadStream(originalname, {
            metadata: {
                author: req.body.author,
                contentType: mimetype,
                extension: extension
            }
        });
        uploadStream.write(buffer);
        uploadStream.end();
        uploadStream.on('finish', () => {
            res.status(201).send('File uploaded successfully');
        });
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getFile = async (req, res) => {
    try {
        const fileId = new ObjectId(req.params.id);
        const downloadStream = gridFSBucket.openDownloadStream(fileId);
        downloadStream.on('error', (error) => {
            res.status(404).send('File not found');
        });
        downloadStream.pipe(res);
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = { storeFile, getFile };
