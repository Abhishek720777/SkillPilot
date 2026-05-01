const mongoose = require("mongoose");

const quizSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    subtopicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subtopic",
      required: true,
    },
    numQuestions: { type: Number, required: true },
    score: { type: Number, default: 0 },
    total: { type: Number, required: true },
    timeTaken: { type: Number, default: 0 },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId }],
    results: [mongoose.Schema.Types.Mixed],
    completedAt: { type: Date },
  },
  { timestamps: true },
);

quizSessionSchema.index({ userId: 1 });
quizSessionSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model("QuizSession", quizSessionSchema);
