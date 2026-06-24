export type CustomConfig =
  | string
  | number
  | boolean
  | null
  | CustomConfig[]
  | { [key: string]: CustomConfig };
