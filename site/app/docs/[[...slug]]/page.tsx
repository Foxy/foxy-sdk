import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { Children, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { MemberMeta } from '@/components/member-meta';

// Sub-sections that repeat under every member, matched by their anchor
// (`#returns`, `#returns-2`, ...); the TOC stops at the member name.
const memberDetail = /^#(parameters|returns|throws|type-parameters|(call|get|set)-signature)(-\d+)?$/;

const isMeta = (node: ReactNode) => isValidElement(node) && node.type === MemberMeta;

/** A heading's TOC title without its `MemberMeta`: the TOC item is a link, and the badge can hold one too. */
function withoutMeta(title: ReactNode) {
  if (!isValidElement<{ children?: ReactNode }>(title)) return title;
  const parts = Children.toArray(title.props.children);
  return parts.some(isMeta) ? parts.filter((part) => !isMeta(part)) : title;
}

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  return (
    <DocsPage
      toc={page.data.toc
        .filter((item) => item.depth <= 3 && !(item.depth === 3 && memberDetail.test(item.url)))
        .map((item) => ({ ...item, title: withoutMeta(item.title) }))}
      full={page.data.full}
      breadcrumb={{ enabled: false }}
      // Fumadocs' top padding assumes its own nav. 18px puts the title's cap
      // height level with the first sidebar and TOC lines, which sit 24px down.
      className="md:pt-[18px] xl:pt-[18px]"
      tableOfContent={{ style: 'block', container: { className: 'pt-6' } }}
      tableOfContentPopover={{ style: 'block' }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
