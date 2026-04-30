function calculateExp(score, totalQuestions) {
  if (totalQuestions === 0) return 0;
  
  const accuracy = score / totalQuestions;
  
  if (accuracy >= 0.7) {
    return 15;
  } else if (accuracy >= 0.5) {
    return 5;
  } else {
    return -10;
  }
}

module.exports = { calculateExp };
