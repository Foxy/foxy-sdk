import { createSSOURL } from '../../admin/createSSOURL.js';

describe('Admin', () => {
  describe('createSSOURL', () => {
    beforeAll(() => vi.spyOn(Date, 'now').mockImplementation(() => 1585402055672));
    afterAll(() => vi.restoreAllMocks());

    it('errors with incorrect params', async () => {
      const incorrectParams = ({
        customer: 'oh no, it is a string!',
        domain: 321,
        secret: {},
        session: 456,
        timestamp: 'i am not a unix timestamp',
      } as unknown) as Parameters<typeof createSSOURL>[0];

      await expect(createSSOURL(incorrectParams)).rejects.toThrow(TypeError);
    });

    it('works with required params', async () => {
      const url = await createSSOURL({
        customer: 12345,
        domain: 'https://foxy-demo.foxycart.com',
        secret: 'yes, very',
      });

      expect(url).toBe(
        'https://foxy-demo.foxycart.com/checkout?fc_customer_id=12345&fc_auth_token=fe55dd1299ce7db668bd43ee3284e823a84fe3b3&timestamp=1585405655',
      );
    });

    it('explicitly sets the timestamp if provided', async () => {
      const url = await createSSOURL({
        customer: 12345,
        domain: 'https://foxy-demo.foxycart.com',
        secret: 'yes, very',
        timestamp: 1595406051,
      });

      expect(url).toBe(
        'https://foxy-demo.foxycart.com/checkout?fc_customer_id=12345&fc_auth_token=0d26d6129051d4175ed76cba20914b8855327e63&timestamp=1595406051',
      );
    });

    it('sets fcsid query param if session value is passed in', async () => {
      const url = await createSSOURL({
        customer: 12345,
        domain: 'https://foxy-demo.foxycart.com',
        secret: 'yes, very',
        session: 'so_awesomely_unique',
      });

      expect(url).toBe(
        'https://foxy-demo.foxycart.com/checkout?fc_customer_id=12345&fc_auth_token=fe55dd1299ce7db668bd43ee3284e823a84fe3b3&timestamp=1585405655&fcsid=so_awesomely_unique',
      );
    });
  });
});
