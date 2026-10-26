import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
      // the site header replaces the default top nav
      enabled: false,
    },
    // search lives in the site header, not the sidebar
    searchToggle: { enabled: false },
  };
}
