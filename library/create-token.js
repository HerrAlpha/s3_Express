const { Token, Tokens } = require('../model/personal-token');
const jwt = require('jsonwebtoken');
const { encrypt } = require('../security/encryption');

const createToken = async (userId, ability) => {

    const findToken = await Tokens.findOne({ userId: userId });
    
    console.log('Find token:', findToken);

    if (findToken) {
        return res.send('Token already exists');
    }
    
    // try {
    //     const token = jwt.sign({ userId, ability }, process.env.JWT_SECRET, { expiresIn: '1h' });
    //     const encryptedToken = encrypt(token, userId); // Encrypting the token directly

    //     // Creating a new Token instance
    //     const newToken = new Tokens({
    //         userId: userId,
    //         token: encryptedToken,
    //         ability: ability
    //     });

    //     // Saving the new token to the database
    //     await newToken.save();
        
    //     return token; // Returning the unencrypted token for response
    // } catch (error) {
    //     console.error('Error creating token:', error);
    //     throw error; // Propagating the error up
    // }
}

module.exports = createToken;
