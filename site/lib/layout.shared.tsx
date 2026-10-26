import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    // the site header replaces the default top nav
    nav: { enabled: false },
    // search lives in the site header, not the sidebar
    searchToggle: { enabled: false },
  };
}
