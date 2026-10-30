import Link from 'next/link';

type MemberMetaProps = {
  /** The member's type, as TypeScript writes it. */
  type: string;
  /** Page of the type, if it has one. */
  href?: string;
  readonly?: boolean;
  static?: boolean;
  optional?: boolean;
  getter?: boolean;
  setter?: boolean;
};

const typeBadge =
  'rounded-md border border-fd-border bg-fd-muted px-1.5 py-0.5 font-mono text-[0.8125rem] font-normal leading-none text-fd-foreground';
const flagBadge = 'rounded-md px-1.5 py-0.5 font-mono text-xs font-normal leading-none text-fd-muted-foreground ring-1 ring-inset ring-fd-border';

/**
 * Type and modifiers of a class member, shown next to its heading. Written inside the
 * heading in MDX (`### name <MemberMeta type="..." /> [#name]`), with an `import` of it on the
 * page because the TOC is built from the heading. The h3 component moves it out of the heading
 * link, and the docs page drops it from the TOC titles.
 */
export function MemberMeta({ type, href, readonly, static: isStatic, optional, getter, setter }: MemberMetaProps) {
  const flags = [
    isStatic && 'static',
    readonly && 'readonly',
    optional && 'optional',
    getter && 'getter',
    setter && 'setter',
  ].filter(Boolean);
  return (
    <span className="not-prose inline-flex flex-wrap items-center gap-1.5">
      {href ? (
        <Link href={href} className={`${typeBadge} text-fd-primary hover:underline`}>
          {type}
        </Link>
      ) : (
        <code className={typeBadge}>{type}</code>
      )}
      {flags.map((flag) => (
        <span key={String(flag)} className={flagBadge}>
          {flag}
        </span>
      ))}
    </span>
  );
}
