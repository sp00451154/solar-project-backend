var mongoose = require('mongoose');

const expanseUpload = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    spentAmount: {
        type: Number,
        required: true,
    },
    spentOn: {
        type: String,
        required: true,
    }

});
module.exports = mongoose.model('ExpanseUpload', expanseUpload);