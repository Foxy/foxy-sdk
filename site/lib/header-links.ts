import { gitConfig } from './shared';

export const headerLinks = [
  { label: 'Help Center', href: 'https://foxy.io/help/' },
  { label: 'API Documentation', href: 'https://api.foxy.io/docs' },
  {
    label: 'GitHub',
    href: `https://github.com/${gitConfig.user}/${gitConfig.repo}/tree/${gitConfig.branch}`,
  },
  { label: 'System Status', href: 'https://status.foxy.io/' },
] as const;
