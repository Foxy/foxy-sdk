import { AuthError } from '../../../src/core/API/AuthError';

describe('Core', () => {
  describe('API', () => {
    describe('AuthError', () => {
      it('exposes error codes as static members', () => {
        expect(AuthError).toHaveProperty('NEW_PASSWORD_REQUIRED');
        expect(AuthError).toHaveProperty('INVALID_NEW_PASSWORD');
        expect(AuthError).toHaveProperty('UNAUTHORIZED');
        expect(AuthError).toHaveProperty('INVALID_FORM');
        expect(AuthError).toHaveProperty('UNAVAILABLE');
        expect(AuthError).toHaveProperty('UNKNOWN');
      });

      it('extends Error', () => {
        const error = new AuthError({ code: AuthError.UNKNOWN });
        expect(error).toBeInstanceOf(Error);
      });

      it('stores error code in the .code property', () => {
        const code = AuthError.UNAUTHORIZED;
        const error = new AuthError({ code });
        expect(error).toHaveProperty('code', code);
      });

      it('stores undefined in the .originalError property when constructed without params.originalError', () => {
        const error = new AuthError({ code: AuthError.UNKNOWN });
        expect(error).toHaveProperty('originalError', undefined);
      });

      it('stores provided value in the .originalError property when constructed with params.originalError', () => {
        const originalError = new Error();
        const error = new AuthError({ code: AuthError.UNKNOWN, originalError });
        expect(error).toHaveProperty('originalError', originalError);
      });
    });
  });
});
