import { ResolutionError } from '../../../src/core/API/ResolutionError';
import { Response } from 'cross-fetch';

describe('Core', () => {
  describe('API', () => {
    describe('ResolutionError', () => {
      let response: Response;
      let error: ResolutionError;

      beforeEach(() => {
        response = new Response();
        error = new ResolutionError(response);
      });

      it('extends Error', () => {
        expect(error).toBeInstanceOf(Error);
      });

      it('stores response in the .response property', () => {
        expect(error).toHaveProperty('response', response);
      });

      it('errors when constructed with incorrect arguments', () => {
        const incorrectArgument = (null as unknown) as Response;
        expect(() => new ResolutionError(incorrectArgument)).toThrow();
      });
    });
  });
});
