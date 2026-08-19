import * as Core from '../../core/index.js';

describe('Core', () => {
  describe('index', () => {
    it('exports the client classes', () => {
      expect(Core).toHaveProperty('API');
      expect(Core).toHaveProperty('Node');
      expect(Core).toHaveProperty('Response');
      expect(Core).toHaveProperty('AuthError');
      expect(Core).toHaveProperty('ResolutionError');
      expect(Core).toHaveProperty('getResourceId');
    });

    it('does not export the Nucleon-era surface', () => {
      expect(Core).not.toHaveProperty('BooleanSelector');
      expect(Core).not.toHaveProperty('Nucleon');
      expect(Core).not.toHaveProperty('Rumour');
    });
  });
});
