/** Custom fields without the `h:` prefix. For example, if we get `h:name=value`, the object will have `name: "value"`. */
export type CustomFields = Record<string, string>;
