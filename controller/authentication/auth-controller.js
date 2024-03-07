const { User, create } = require('../../model/user');
const { postLogin201, post201, get401, get200, get422 } = require('../../library/response-library');
const { encrypt, decrypt } = require('../../security/encryption');
const Users = require('../../model/user');
const { Tokens } = require('../../model/personal-token');
const jwt = require('jsonwebtoken');
const { checkApiKey, deleteCurrentToken, checkTokenWithAuthorizationUser } = require('../../security/token-checking');
const Validator = require('../../library/validation');

const createToken = async (userId, ability, res) => {
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
    
}

const login = async (req, res) => {
    const { username, password } = req.body;

    const validation = new Validator();

    validation.validate({
        username: username,
        password: password
    }, {
        username: 'required|string|alpha|between:3,16',
        password: 'required|string|alpha_num|between:8,16'
    }, res);

    if (validation.statusValidation === false) {
        return get422(res, validation.errorInfo); // Return 422 if validation fails
    }

    if (!username || !password) {
        return get401(res);
    }
    if (!checkApiKey(req, res)) {
        return get401(res);
    }

        const user = await Users.findOne({ username: username });
        console.log('password:', user.password);
        const decryptedPassword = decrypt(user.password, user.username);
        console.log('Decrypted password:', decryptedPassword);

        if (decryptedPassword !== password) {
            return get401(res);
        }

        if (!user) {
            return get401(res); // User not found, return 401
        }

        // Check if token already exists for the user
        const existingToken = await Tokens.findOne({ userId: user._id });

        if (existingToken) {
            console.log('Token already exists for the user');
            return get401(res); // Token already exists, return 401
        }

        // Create a new token if none exists for the user
        const token = await createToken(user._id, 'user', res);
        if (!token) {
            console.log('Token creation failed');
            return get422(res, 'Token failed to retrieve'); // Token creation failed, return 500
        }

        console.log('Token:', token);
        return postLogin201(res, user, token);
}

const register = async (req, res) => {

    const { username, password } = req.body;

    const validation = new Validator();

    validation.validate({
        username: username,
        password: password
    }, {
        username: 'required|string|alpha|between:3,16',
        password: 'required|string|alpha_num|between:8,16'
    }, res);

    if (validation.statusValidation === false) {
        return get422(res, validation.errorInfo); // Return 422 if validation fails
    }

    if (!checkApiKey(req, res)) {
        return get401(res);
    }
    
        const keyUsername = String(username);
        const encryptedPassword = encrypt(password, keyUsername);
        const newUser = new Users({ 
            username: keyUsername,
            password: encryptedPassword
         });
        await newUser.save();
        return post201(res, newUser);
}


const logout = async (req, res) => {
    const userId = req.body.userId;
    const statusToken = await checkTokenWithAuthorizationUser(userId, req, res); // Pass userId, req, res to checkTokenWithAuthorizationUser
    console.log('Status token:', statusToken);
    if (!statusToken) {
        return get401(res);
    }
        await deleteCurrentToken(req, userId); // Use await to delete the token
        return get200(res, 'User logged out successfully!');
}

module.exports = { login, register, logout };
