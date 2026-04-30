const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  subtopicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subtopic', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  explanation: { type: String },
  codeSnippet: { type: String },
  isExecutionTask: { type: Boolean, default: false },
  language: { type: String, default: 'javascript' }, // default language for editor
  testCases: [{ input: String, expectedOutput: String }],
});

module.exports = mongoose.model('Question', questionSchema);
