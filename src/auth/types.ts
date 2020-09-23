export interface Auth {
  endpoint: string;
  signIn: (...args: any[]) => Promise<void>;
  signOut: () => void;
  fetch: Window["fetch"];
}
