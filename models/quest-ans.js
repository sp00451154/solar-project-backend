var mongoose = require('mongoose');

const questionAnswerSchema = mongoose.Schema({
    question: {
        type: String,
        required: true,
        maxlength: 1000000
    },
    answer: {
        type: String,
        required: true,
        maxlength: 1000000
    },
    topic: {
        type: String,
        required: true,
    },
    links: [{
        name: String
    }],
    image: [{
        image: String,
    }],

});
module.exports = mongoose.model('QuestionAnswer', questionAnswerSchema);