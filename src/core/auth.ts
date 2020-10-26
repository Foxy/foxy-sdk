export interface BrowserAPICredentials {
  email: string;
  password: string;
  newPassword?: string;
}

export interface BrowserAPIParameters {
  storage?: Storage;
  baseURL: URL; // pathname ending with "/" !!!
}
