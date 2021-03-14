var mongoose = require('mongoose');

const questionAnswerSchema = mongoose.Schema({
    question: {
        type: String,
        required: true,
        maxlength: 1000
    },
    answer: {
        type: String,
        required: true,
        maxlength: 1000
    },
    topic: {
        type: String,
        required: true,
    },
    
});
module.exports = mongoose.model('QuestionAnswer', questionAnswerSchema);