const { model, Schema } = require('mongoose');

const accountSchema = new Schema({
    owner: {
        type: String,
        required: true,
        ref: 'User'
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
});

module.exports = model('Account', accountSchema);