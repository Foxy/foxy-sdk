'use client';

import { CopyCheckIcon, LinkIcon } from 'lucide-react';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import type { ComponentProps, ReactNode } from 'react';

/**
 * Fumadocs' `Heading` for a class member, with the `MemberMeta` badges between the name and
 * the copy-link button. Inside `Heading` the badges would sit in the heading link, and next to
 * it they would sit after the hidden button, which leaves a gap.
 */
export function MemberHeading({ id, meta, children, className, ...props }: ComponentProps<'h3'> & { meta: ReactNode }) {
  const [isChecked, onCopy] = useCopyButton(() => {
    const url = new URL(window.location.href);
    url.hash = id ?? '';
    return navigator.clipboard.writeText(url.href);
  });

  return (
    <h3 id={id} {...props} className={`group/heading member-heading flex scroll-m-28 flex-row flex-wrap items-center gap-x-2.5 gap-y-1 ${className ?? ''}`}>
      <a data-card="" href={`#${id}`}>
        {children}
      </a>
      {meta}
      <button
        type="button"
        aria-live="polite"
        onClick={onCopy}
        className={`${buttonVariants({ variant: 'ghost', size: 'icon-xs' })} not-prose -ms-1.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity group-hover/heading:opacity-100 focus-visible:opacity-100`}
      >
        {isChecked ? <CopyCheckIcon /> : <LinkIcon />}
        <span className="sr-only">{isChecked ? 'Copied Anchor Link' : 'Copy Anchor Link'}</span>
      </button>
    </h3>
  );
}
