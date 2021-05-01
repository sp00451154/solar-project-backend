var mongoose = require('mongoose');

const roommateUpload = mongoose.Schema({
    expanseAmount: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    }

});
module.exports = mongoose.model('RoommateSchema', roommateUpload);