var mongoose = require('mongoose');

const TopicSchema = mongoose.Schema({
    topics: [{
        name: String
    }],
});
module.exports = mongoose.model('TopicList', TopicSchema);