const mongoose = require('mongoose');

const basicSchema = new mongoose.Schema({
    // Define the schema here
    // Example: username: { type: String, required: true }
});

const Basics = mongoose.model('Basics', basicSchema);

module.exports = Basics;
