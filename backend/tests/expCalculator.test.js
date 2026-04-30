const { calculateExp } = require('../utils/expCalculator');

describe('calculateExp Unit Tests', () => {
  it('should award 15 EXP when accuracy is 70% or higher', () => {
    // 7 out of 10 is 70%
    const exp = calculateExp(7, 10);
    expect(exp).toBe(15);
  });

  it('should award 5 EXP when accuracy is between 50% and 69%', () => {
    // 6 out of 10 is 60%
    const exp = calculateExp(6, 10);
    expect(exp).toBe(5);
  });

  it('should deduct 10 EXP when accuracy is below 50%', () => {
    // 4 out of 10 is 40%
    const exp = calculateExp(4, 10);
    expect(exp).toBe(-10);
  });

  it('should return 0 EXP if total questions is 0 to avoid division by zero', () => {
    const exp = calculateExp(0, 0);
    expect(exp).toBe(0);
  });
});
