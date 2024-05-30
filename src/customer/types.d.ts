/** Tokenization embed configuration that can be updated any time after mount. */
export type TokenizationEmbedConfig = Partial<{
  /** Translations. Note that Stripe and Square provide their own translations that can't be customized. */
  translations: {
    stripe?: {
      label?: string;
      status?: {
        idle?: string;
        busy?: string;
        fail?: string;
      };
    };
    square?: {
      label?: string;
      status?: {
        idle?: string;
        busy?: string;
        fail?: string;
      };
    };
    default?: {
      'cc-number'?: {
        label?: string;
        placeholder?: string;
        v8n_required?: string;
        v8n_invalid?: string;
        v8n_unsupported?: string;
      };
      'cc-exp'?: {
        label?: string;
        placeholder?: string;
        v8n_required?: string;
        v8n_invalid?: string;
        v8n_expired?: string;
      };
      'cc-csc'?: {
        label?: string;
        placeholder?: string;
        v8n_required?: string;
        v8n_invalid?: string;
      };
      'status'?: {
        idle?: string;
        busy?: string;
        fail?: string;
        misconfigured?: string;
      };
    };
  };
  /** If true, all fields inside the embed will be disabled. */
  disabled: boolean;
  /** If true, all fields inside the embed will be set to be read-only. For Stripe and Square the fields will be disabled and styled as readonly. */
  readonly: boolean;
  /** Appearance settings. */
  style: Partial<{
    '--lumo-space-m': string;
    '--lumo-space-s': string;
    '--lumo-contrast-5pct': string;
    '--lumo-contrast-10pct': string;
    '--lumo-contrast-50pct': string;
    '--lumo-size-m': string;
    '--lumo-size-xs': string;
    '--lumo-border-radius-m': string;
    '--lumo-border-radius-s': string;
    '--lumo-font-family': string;
    '--lumo-font-size-m': string;
    '--lumo-font-size-s': string;
    '--lumo-font-size-xs': string;
    '--lumo-primary-color': string;
    '--lumo-primary-text-color': string;
    '--lumo-primary-color-50pct': string;
    '--lumo-secondary-text-color': string;
    '--lumo-disabled-text-color': string;
    '--lumo-body-text-color': string;
    '--lumo-error-text-color': string;
    '--lumo-error-color-10pct': string;
    '--lumo-error-color-50pct': string;
    '--lumo-line-height-xs': string;
    '--lumo-base-color': string;
  }>;
  /** Locale to use with Stripe or Square. Has no effect on the default UI. */
  lang: string;
}>;

/** User credentials for authentication. */
export interface Credentials {
  /** Email address associated with an account. */
  email: string;
  /** Current password during regular sign-in, temporary password or a one-time code during access recovery. */
  password: string;
}

/** Account creation parameters. */
export interface SignUpParams {
  /** Signup verification (currently only hCaptcha is supported). */
  verification: {
    /** Verification type. Currently only hCaptcha is supported. */
    type: 'hcaptcha';
    /** hCaptcha verification token. */
    token: string;
  };
  /** Customer's first name, optional, up to 50 characters. */
  first_name?: string;
  /** Customer's last name, optional, up to 50 characters. */
  last_name?: string;
  /** Customer's password (up to 50 characters). If not provided, Foxy will generate a random password for this account server-side. */
  password?: string;
  /** Customer's email address (up to 100 characters), required. */
  email: string;
}

export interface Session {
  session_token: string;
  expires_in: number;
  jwt: string;
}

export interface StoredSession extends Session {
  date_created: string;
}
