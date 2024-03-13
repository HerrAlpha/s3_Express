const mongoose = require('mongoose');

const ottokenSchema = new mongoose.Schema({
    // Define the schema here
    // Example: username: { type: String, required: true }
    token: { type: String, required: true },
    userId: { type: String, required: true },
    ability: { type: String, required: true },
    fileId: { type: String, required: true },

});

const Ottokens = mongoose.model('Ottokens', ottokenSchema);

module.exports = Ottokens;
