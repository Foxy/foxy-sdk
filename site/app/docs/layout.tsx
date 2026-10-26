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
        sidebar={{
          banner: <MobileLinks />,
          collapsible: false,
          // the title block above the tree is empty on wide screens: no title, and MobileLinks is md:hidden
          className: '[&>div:first-child]:hidden',
        }}
      >
        {children}
      </DocsLayout>
    </>
  );
}
