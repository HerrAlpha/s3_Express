const { User, create } = require('../../model/user');
const { postLogin201, post201, get401 } = require('../../library/response-library');
const { encrypt, decrypt } = require('../../security/encryption');
const { Readable } = require('stream');
const { Parent } = require('../../model/file');
const Users = require('../../model/user');
const { createToken } = require('../../library/create-token');
const { Tokens } = require('../../model/personal-token');
const jwt = require('jsonwebtoken');
// const { encrypt } = require('../security/encryption');

const createToken1 =  (userId, ability) => {
    try {
        const token = jwt.sign({ userId, ability }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const encryptedToken = encrypt(token, userId); // Encrypting the token directly

        console.log('Encrypted token:', encryptedToken);

        // Creating a new Token instance
        const newToken = new Tokens({
            userId: userId,
            token: encryptedToken,
            ability: ability
        });

        // Saving the new token to the database
         newToken.save();
        
        return token; // Returning the unencrypted token for response
    } catch (error) {
        console.error('Error creating token:', error);
        throw error; // Propagating the error up
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;
            console.log('Username:', req.body.username);
        console.log('Password:', req.body.password);
    // const encryptedPassword = encrypt(password, username);
    try {
        const user = await Users.findOne({ username: username, password: password });
        console.log('User:', user);

        if (user) {
            const token = createToken1(user._id, 'user'); // Assuming createToken is defined somewhere
            console.log('Token:', token);
            return res.status(201).json(postLogin201(user, token));
        } else {
            return res.status(401).json(get401());
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const keyUsername = String(username);
        const encryptedPassword = encrypt(password, keyUsername);
        const newUser = new User({ 
            username: keyUsername,
            password: encryptedPassword
         });
        await newUser.save();
        return res.status(201).json(post201(newUser));
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { login, register };
