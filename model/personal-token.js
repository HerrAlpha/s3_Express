const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    token: String,
    ability: String
});

const Tokens = mongoose.model('Token', tokenSchema);

module.exports = { Tokens };
