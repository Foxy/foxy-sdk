import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Heading } from 'fumadocs-ui/components/heading';
import { Children, isValidElement } from 'react';
import type { ComponentProps } from 'react';
import type { MDXComponents } from 'mdx/types';
import { MemberMeta } from '@/components/member-meta';
import { MemberHeading } from '@/components/member-heading';

/** An h3 that shows a `MemberMeta` after the heading link instead of inside it. */
function H3({ children, ...props }: ComponentProps<'h3'>) {
  const parts = Children.toArray(children);
  const meta = parts.filter((part) => isValidElement(part) && part.type === MemberMeta);
  if (!meta.length) return <Heading as="h3" {...props}>{children}</Heading>;
  return (
    <MemberHeading {...props} meta={meta}>
      {parts.filter((part) => !meta.includes(part))}
    </MemberHeading>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    h3: H3,
    MemberMeta,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
