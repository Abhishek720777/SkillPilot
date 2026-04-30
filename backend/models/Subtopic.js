const mongoose = require('mongoose');

const subtopicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
});

module.exports = mongoose.model('Subtopic', subtopicSchema);
