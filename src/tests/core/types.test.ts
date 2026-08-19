import type { Graph } from '../../core/Graph';
import type { Query } from '../../core/Query/Query';
import type { Resource } from '../../core/Resource/Resource';

interface Item extends Graph {
  curie: 'fx:item';
  links: { 'self': Item };
  props: { name: string; price: number; quantity: number };
}

interface Items extends Graph {
  curie: 'fx:items';
  child: Item;
  links: { 'self': Items };
  props: { total_items: number };
}

interface Cart extends Graph {
  curie: 'fx:cart';
  links: { 'self': Cart; 'fx:items': Items };
  props: { id: number; total_order: number };
  zooms: { items?: Items };
}

describe('Core', () => {
  describe('types', () => {
    it('builds a resource with links, props and no embeds', () => {
      // Item, not Cart: any graph declaring `zooms` gets a required `_embedded`
      // of type `unknown` when no zoom is queried, because UnionToIntersection<never>
      // infers `unknown`, which ExcludeNever cannot strip.
      const item: Resource<Item> = {
        _links: { 'self': { href: 'https://example.com/items/1' } },
        name: 'Cup',
        price: 5,
        quantity: 2,
      };

      expect(item.name).toBe('Cup');
    });

    it('narrows props to the requested fields', () => {
      const query = { fields: ['name'] } as const satisfies Query<Item>;
      const item: Resource<Item, typeof query> = {
        _links: { 'self': { href: 'https://example.com/items/1' } },
        name: 'Cup',
      };

      expect(item.name).toBe('Cup');
    });

    it('embeds a zoomed collection under its curie', () => {
      const query = { zoom: 'items' } as const satisfies Query<Cart>;
      const cart: Resource<Cart, typeof query> = {
        _embedded: {
          'fx:items': [
            { _links: { 'self': { href: 'https://example.com/items/1' } }, name: 'Cup', price: 5, quantity: 2 },
          ],
        },
        _links: { 'self': { href: 'https://example.com/carts/1' }, 'fx:items': { href: 'https://example.com/items' } },
        id: 1,
        total_order: 10,
      };

      expect(cart._embedded['fx:items']).toHaveLength(1);
    });
  });
});
