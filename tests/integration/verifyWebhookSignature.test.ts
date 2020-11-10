import { verifyWebhookSignature } from '../../src/integration/verifyWebhookSignature';

describe('Integration', () => {
  describe('verifyWebhookSignature', () => {
    it('errors with incorrect params', () => {
      const invalidParams = ({
        key: 0,
        payload: {},
        signature: null,
      } as unknown) as Parameters<typeof verifyWebhookSignature>[0];

      expect(() => verifyWebhookSignature(invalidParams)).toThrow();
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
