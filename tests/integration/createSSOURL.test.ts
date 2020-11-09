import { createSSOURL } from '../../src/integration/createSSOURL';

describe('Integration', () => {
  describe('createSSOURL', () => {
    beforeAll(() => jest.spyOn(Date, 'now').mockImplementation(() => 1585402055672));

    it('errors with incorrect params', () => {
      const incorrectParams = ({
        customer: 'oh no, it is a string!',
        domain: 321,
        secret: {},
        session: 456,
        timestamp: 'i am not a unix timestamp',
      } as unknown) as Parameters<typeof createSSOURL>[0];

      expect(() => createSSOURL(incorrectParams)).toThrow();
    });

    it('works with required params', () => {
      const url = createSSOURL({
        customer: 12345,
        domain: 'https://foxy-demo.foxycart.com',
        secret: 'yes, very',
      });

      expect(url).toBe(
        'https://foxy-demo.foxycart.com/checkout?fc_customer_id=12345&fc_auth_token=097e56e8db16788ec90b4857439098adc3fa8cb2&timestamp=1585402055672'
      );
    });

    it('explicitly sets the timestamp if provided', () => {
      const url = createSSOURL({
        customer: 12345,
        domain: 'https://foxy-demo.foxycart.com',
        secret: 'yes, very',
        timestamp: 1595406051672,
      });

      expect(url).toBe(
        'https://foxy-demo.foxycart.com/checkout?fc_customer_id=12345&fc_auth_token=2682b3c43e97c98efbe7102e5f46aea5ee81834c&timestamp=1595406051672'
      );
    });

    it('sets fcsid query param if session value is passed in', () => {
      const url = createSSOURL({
        customer: 12345,
        domain: 'https://foxy-demo.foxycart.com',
        secret: 'yes, very',
        session: 'so_awesomely_unique',
      });

      expect(url).toBe(
        'https://foxy-demo.foxycart.com/checkout?fc_customer_id=12345&fc_auth_token=097e56e8db16788ec90b4857439098adc3fa8cb2&timestamp=1585402055672&fcsid=so_awesomely_unique'
      );
    });
  });
});
