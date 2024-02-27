const crypto = require('crypto');
const dotenv = require('dotenv');

const algorithm = 'aes-256-cbc';
dotenv.config(); // Configure dotenv before using process.env
const privateKey = process.env.PRIVATE_KEY_USER;

const generateKey = (key) => {
    return crypto.createHash('sha256').update(key + privateKey).digest().slice(0, 32);
}

const encrypt = (text, key) => {
    // Convert text to string
    text = String(text);

    const cryptKey = generateKey(key);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, cryptKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

const decrypt = (text, key) => {
    // Convert text to string
    text = String(text);

    const cryptKey = generateKey(key);
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, cryptKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
