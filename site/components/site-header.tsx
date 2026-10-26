'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Container } from 'fumadocs-ui/layouts/docs/slots/container';
import { useDocsLayout } from 'fumadocs-ui/layouts/docs';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { useTreeContext, useTreePath } from 'fumadocs-ui/contexts/tree';
import { getBreadcrumbItemsFromPath } from 'fumadocs-core/breadcrumb';
import type { ComponentProps } from 'react';
import type * as PageTree from 'fumadocs-core/page-tree';
import { docsRoute } from '@/lib/shared';
import { headerLinks } from '@/lib/header-links';

const focus =
  'outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background';
const focusOnDark =
  'outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#3B1142]';
const searchButton =
  'flex items-center rounded-lg border border-[rgba(33,50,91,0.1)] bg-fd-background text-fd-foreground transition-colors hover:bg-fd-accent dark:border-fd-border dark:bg-fd-card dark:hover:bg-fd-accent';

function SearchButton({ compact }: { compact?: boolean }) {
  const { enabled, setOpenSearch } = useSearchContext();

  // ⌘K / Ctrl+K is handled by Fumadocs; "/" is added here.
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, select, [contenteditable]')) return;
      e.preventDefault();
      setOpenSearch(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, setOpenSearch]);

  if (!enabled) return null;
  if (compact) {
    return (
      <button
        type="button"
        aria-label="Search docs"
        aria-haspopup="dialog"
        onClick={() => setOpenSearch(true)}
        className={`${searchButton} ${focus} size-[47px] shrink-0 justify-center md:hidden`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      </button>
    );
  }
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-keyshortcuts="/ Control+K Meta+K"
      onClick={() => setOpenSearch(true)}
      className={`${searchButton} ${focus} h-[47px] w-[214px] shrink-0 gap-2 px-3.5 text-sm max-md:hidden`}
    >
      <span>Search docs</span>
      <kbd className="ms-auto inline-flex size-6 items-center justify-center rounded-md border border-[rgba(33,50,91,0.1)] text-xs dark:border-fd-border">
        /
      </kbd>
    </button>
  );
}

/** The folder's index page url: its first page, when it is named like the folder. */
function indexOf(folder: PageTree.Folder) {
  const first = folder.children.find((c) => c.type === 'page');
  return first?.type === 'page' && first.name === folder.name ? first.url : undefined;
}

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function Breadcrumbs() {
  const path = useTreePath();
  const { root } = useTreeContext();
  const current = path[path.length - 1] as { url?: string; name?: unknown };
  const items = useMemo(() => {
    const list = getBreadcrumbItemsFromPath(root, path, { includePage: false }).map((item) => {
      if (item.url) return item;
      const at = path.findIndex((n) => n.type === 'folder' && n.name === item.name);
      const folder = path[at];
      if (folder?.type !== 'folder') return item;
      const index = indexOf(folder);
      if (index) return { ...item, url: index };
      // a kind folder (Classes, Interfaces, ...) links to its section heading
      for (let i = at - 1; i >= 0; i--) {
        const parent = path[i];
        const parentIndex = parent.type === 'folder' ? indexOf(parent) : undefined;
        if (parentIndex) return { ...item, url: `${parentIndex}#${slugify(String(item.name))}` };
      }
      return item;
    });
    // an index page's own folder is the page itself, not a parent
    if (list.length && list[list.length - 1].name === current.name) list.pop();
    return list;
  }, [root, path, current.name]);
  // nearest ancestor that is not this page
  const parent = [...items].reverse().find((item) => item.url && item.url !== current.url);

  return (
    <>
      <nav aria-label="Breadcrumb" className="min-w-0 max-md:hidden">
        <ol className="flex items-center gap-1.5 text-[0.91875rem] text-fd-primary">
          <li className="flex items-center">
            <Link href={`${docsRoute}/`} aria-label="Docs home" className={`${focus} rounded-sm`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-[15px]"
                aria-hidden
              >
                <path d="M3 11.5 12 4l9 7.5" />
                <path d="M5.5 10v9.5h4.5V14h4v5.5h4.5V10" />
              </svg>
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={i} className="flex min-w-0 items-center gap-1.5">
              <span aria-hidden className="text-fd-foreground dark:text-fd-muted-foreground">
                /
              </span>
              {item.url ? (
                <Link href={item.url} className={`${focus} truncate rounded-sm hover:underline`}>
                  {item.name}
                </Link>
              ) : (
                <span className="truncate">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {parent?.url && (
        <Link
          href={parent.url}
          className={`${focus} min-w-0 truncate rounded-sm text-[0.91875rem] text-fd-primary md:hidden`}
        >
          ‹ Back to {parent.name}
        </Link>
      )}
    </>
  );
}

function SiteHeader() {
  const { slots } = useDocsLayout();
  const Trigger = slots.sidebar.trigger;
  const home = `${docsRoute}/`;

  return (
    <header>
      <div className="flex h-[73px] items-center bg-[#3B1142] px-4 md:px-[37px]">
        <Link href={home} className={`${focusOnDark} shrink-0 rounded-sm`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/foxy-logo-light.svg" alt="Foxy Commerce" width={135} height={35} />
        </Link>
        <Link
          href={home}
          className={`${focusOnDark} ms-3 rounded-[5px] bg-[rgba(247,250,255,0.1)] p-2 text-[0.7875rem] font-bold leading-none text-white`}
        >
          SDK
        </Link>
        <nav aria-label="Foxy resources" className="ms-auto max-md:hidden">
          <ul className="flex items-center gap-6">
            {headerLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${focusOnDark} rounded-sm text-[1.05rem] text-[rgba(255,255,255,0.65)] transition-colors hover:text-white focus-visible:text-white`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <Trigger
          aria-label="Open menu"
          className={`${focusOnDark} ms-auto -me-2 inline-flex size-10 items-center justify-center rounded-md text-white md:hidden`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-6" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Trigger>
      </div>
      <div className="flex h-16 items-center justify-between gap-4 border-b border-[rgba(33,50,91,0.1)] bg-fd-background py-2 dark:border-fd-border px-4 md:px-[37px]">
        <Breadcrumbs />
        <SearchButton />
        <SearchButton compact />
      </div>
    </header>
  );
}

/** Replaces the Fumadocs container slot so the header can sit above the docs grid. */
export function HeaderContainer(props: ComponentProps<'div'>) {
  return (
    <>
      <SiteHeader />
      <Container {...props} />
    </>
  );
}

/** Replaces the Fumadocs sidebar title; the header already shows the logo. */
export function NoNavTitle() {
  return null;
}

/** Rendered at the top of the sidebar drawer; the top bar hides these links on phones. */
export function MobileLinks() {
  return (
    <nav aria-label="Foxy resources" className="md:hidden">
      <ul className="flex flex-col gap-1">
        {headerLinks.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${focus} block rounded-lg p-2 text-fd-foreground hover:bg-fd-accent`}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
