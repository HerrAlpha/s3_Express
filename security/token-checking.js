const { Tokens } = require('../model/personal-token');
const { decrypt } = require('./encryption');
const dotenv = require('dotenv');
const { get401 } = require('../library/response-library');

dotenv.config();

const checkTokenWithAuthorizationUser = async (userId, req, res, next) => {
    try {
        const header = req.headers;
        console.log('Header:', header);
        const reqToken = header['authorization'];
        const reqApiKey = header['x-api-key'];
        const apiKey = process.env.PRIVATE_KEY_USER;

        console.log('API key:', reqApiKey);
        console.log('API key from .env:', apiKey);
        console.log('Token from request:', reqToken);

        if (!reqToken || !reqApiKey || !apiKey) {
            return false;
        }

        const token = await Tokens.findOne({ _id: userId });

        if (!token) {
            return false;
        }

        const finalToken = reqToken.split(' ')[1];
        const decryptedToken = decrypt(token.token, userId);

        if (reqApiKey === apiKey && token.userId === userId && token.ability === 'user' && finalToken === decryptedToken) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error in token validation:', error);
        return false;
    }
};

const checkApiKey = (req, res, next) => {
    try {
        const header = req.headers;
        const reqApiKey = header['x-api-key'];
        const apiKey = process.env.PRIVATE_KEY_USER;

        console.log('API key:', reqApiKey);
        console.log('API key from .env:', apiKey);

        return reqApiKey === apiKey;
    } catch (error) {
        console.error('Error in API key validation:', error);
        return false;
    }
};

const deleteCurrentToken = async (req, userId) => {
    try {
        await Tokens.deleteOne({ userId: userId });
        return true;
    } catch (error) {
        console.error('Error deleting token:', error);
        throw error;
    }
};

module.exports = { checkTokenWithAuthorizationUser, checkApiKey, deleteCurrentToken };
