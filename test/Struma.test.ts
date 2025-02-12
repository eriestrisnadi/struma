import { Struma } from '../src/Struma';

describe('Struma', () => {
  describe('Initialization', () => {
    it('should initialize with Struma instance', () => {
      expect(new Struma()).toBeInstanceOf(Struma);
    });
  });
});
