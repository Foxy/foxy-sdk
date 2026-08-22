import { verifyWebhookSignature } from '../../admin/verifyWebhookSignature.js';

describe('Admin', () => {
  describe('verifyWebhookSignature', () => {
    it('errors with incorrect params', async () => {
      const invalidParams = ({
        key: 0,
        payload: {},
        signature: null,
      } as unknown) as Parameters<typeof verifyWebhookSignature>[0];

      await expect(verifyWebhookSignature(invalidParams)).rejects.toThrow(TypeError);
    });

    it('returns false when webhook signature is invalid', async () => {
      const result = await verifyWebhookSignature({
        key: 'wrong',
        payload: 'very',
        signature: "i'm",
      });

      expect(result).toBe(false);
    });

    it('returns true when webhook signature is valid', async () => {
      const result = await verifyWebhookSignature({
        key: 'is definitely right',
        payload: 'this, on the other hand',
        signature: '055c620a2d1e459b9c4ed676146a6cce9d2ec2e7caf3dba64608c30c4477f532',
      });

      expect(result).toBe(true);
    });

    it('returns false for an empty key instead of throwing', async () => {
      await expect(verifyWebhookSignature({ key: '', payload: 'x', signature: 'y' })).resolves.toBe(false);
    });

    it('returns false for a signature with an odd hex length instead of throwing', async () => {
      const result = await verifyWebhookSignature({
        key: 'is definitely right',
        payload: 'this, on the other hand',
        signature: '055c620a2d1e459b9c4ed676146a6cce9d2ec2e7caf3dba64608c30c4477f53',
      });

      expect(result).toBe(false);
    });

    it('returns false for a signature with non-hex characters instead of throwing', async () => {
      const result = await verifyWebhookSignature({
        key: 'is definitely right',
        payload: 'this, on the other hand',
        signature: 'zzzc620a2d1e459b9c4ed676146a6cce9d2ec2e7caf3dba64608c30c4477f532',
      });

      expect(result).toBe(false);
    });
  });
});
