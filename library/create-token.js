const { Token } = require('../model/personal-token');
const jwt = require('jsonwebtoken');
const { encrypt } = require('../security/encryption');

const createToken = async (userId, ability) => {
    try {
        const token = jwt.sign({ userId, ability }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const encryptedToken = encrypt(token, userId); // Encrypting the token directly

        // Creating a new Token instance
        const newToken = new Token({
            userId: userId,
            token: encryptedToken,
            ability: ability
        });

        // Saving the new token to the database
        await newToken.save();
        
        return token; // Returning the unencrypted token for response
    } catch (error) {
        console.error('Error creating token:', error);
        throw error; // Propagating the error up
    }
}

module.exports = createToken;
