export interface FxAttribute {
  curie: 'fx:attribute';

  links: {
    /** This resource. */
    self: FxAttribute;
  };

  props: {
    /** Controls who can see this attribute. Public attributes can be shown to anyone, including customers. Private attributes are more suitable for configuration or technical details which are irrelevant to the public. Restricted attributes can only be viewed by the OAuth client who creates them. */
    visibility: 'public' | 'private' | 'restricted';
    /** The name of this attribute. */
    name: string;
    /** The value of this attribute. */
    value: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
