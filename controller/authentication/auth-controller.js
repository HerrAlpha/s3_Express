const { User, create } = require('../../model/user');
const { postLogin201, post201, get401, get200 } = require('../../library/response-library');
const { encrypt, decrypt } = require('../../security/encryption');
const Users = require('../../model/user');
const { Tokens } = require('../../model/personal-token');
const jwt = require('jsonwebtoken');
const { checkApiKey, deleteCurrentToken, checkTokenWithAuthorizationUser } = require('../../security/token-checking');

const createToken1 = async (userId, ability, res) => {
    try {
        // Check if token already exists for the user
        const existingToken = await Tokens.findOne({ userId: userId });

        if (existingToken) {
            console.log('Token already exists for the user');
            return null; // Token already exists, return false
        }

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
        await newToken.save();

        return token; // Returning the unencrypted token for response
    } catch (error) {
        console.error('Error creating token:', error);
        throw error; // Propagating the error up
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json(get401());
    }
    if (!checkApiKey(req, res)) {
        return res.status(401).json(get401());
    }

    try {
        const user = await Users.findOne({ username: username, password: password });
        if (!user) {
            return res.json(get401()); // User not found, return 401
        }

        // Check if token already exists for the user
        const existingToken = await Tokens.findOne({ userId: user._id });

        if (existingToken) {
            console.log('Token already exists for the user');
            return res.status(401).json(get401()); // Token already exists, return 401
        }

        // Create a new token if none exists for the user
        const token = await createToken1(user._id, 'user', res);
        if (!token) {
            console.log('Token creation failed');
            return res.status(500).json({ error: 'Internal Server Error' }); // Token creation failed, return 500
        }

        console.log('Token:', token);
        return res.json(postLogin201(user, token));
    } catch (error) {
        console.error('Error during login:', error);
        return res.json({ error: 'Internal Server Error' });
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

const logout = async (req, res) => {
    const userId = req.body.userId;
    const statusToken = await checkTokenWithAuthorizationUser(userId, req, res); // Pass userId, req, res to checkTokenWithAuthorizationUser
    console.log('Status token:', statusToken);
    if (!statusToken) {
        return res.status(401).json(get401());
    }
    try {
        await deleteCurrentToken(req, userId); // Use await to delete the token
        return res.status(200).json(get200('User logged out successfully!'));
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { login, register, logout };
