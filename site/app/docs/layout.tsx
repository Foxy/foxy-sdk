import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { HeaderContainer, MobileLinks, NoNavTitle } from '@/components/site-header';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <>
      <DocsLayout
        tree={source.getPageTree()}
        {...baseOptions()}
        slots={{ container: HeaderContainer, navTitle: NoNavTitle }}
        sidebar={{ banner: <MobileLinks />, collapsible: false }}
      >
        {children}
      </DocsLayout>
    </>
  );
}
