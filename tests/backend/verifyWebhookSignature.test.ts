import { ArgumentError } from '../../src/core/v8n';
import { inspect } from 'util';
import { verifyWebhookSignature } from '../../src/backend/verifyWebhookSignature';

describe('Backend', () => {
  describe('verifyWebhookSignature', () => {
    it('errors with incorrect params', () => {
      const invalidParams = ({
        key: 0,
        payload: {},
        signature: null,
      } as unknown) as Parameters<typeof verifyWebhookSignature>[0];

      expect(() => verifyWebhookSignature(invalidParams)).toThrow();
    });

    it('keeps the key out of the error when params are invalid', () => {
      const params = ({ key: 'webhook-key-secret', payload: 'payload', signature: 0 } as unknown) as Parameters<
        typeof verifyWebhookSignature
      >[0];

      let error: unknown;

      try {
        verifyWebhookSignature(params);
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(ArgumentError);
      expect((error as Error).message).toContain('webhook.signature');
      expect(inspect(error, { depth: null })).not.toContain('webhook-key-secret');
    });

    it('returns false when webhook signature is invalid', () => {
      const result = verifyWebhookSignature({
        key: 'wrong',
        payload: 'very',
        signature: "i'm",
      });

      expect(result).toBe(false);
    });

    it('returns true when webhook signature is valid', () => {
      const result = verifyWebhookSignature({
        key: 'is definitely right',
        payload: 'this, on the other hand',
        signature: '055c620a2d1e459b9c4ed676146a6cce9d2ec2e7caf3dba64608c30c4477f532',
      });

      expect(result).toBe(true);
    });
  });
});
