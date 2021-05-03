var mongoose = require('mongoose');

const roommateSchema = mongoose.Schema({
    expanseAmount: {
        type: Number,
        required: true,
    },
    value: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
    }

});
module.exports = mongoose.model('RoommateSchema', roommateSchema);