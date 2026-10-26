import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { BetaBanner } from '@/components/beta-banner';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <>
      <BetaBanner />
      <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
        {children}
      </DocsLayout>
    </>
  );
}
