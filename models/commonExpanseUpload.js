var mongoose = require('mongoose');

const commonExpanseUpload = mongoose.Schema({
    expanseAmount: {
        type: Number,
        required: true,
    },
    expanseName: {
        type: String,
        required: true,
    }

});
module.exports = mongoose.model('CommonExpanseUpload', commonExpanseUpload);