import type { LoaderPlugin } from 'fumadocs-core/source';
import type * as PageTree from 'fumadocs-core/page-tree';

/** Kind folders of the reference, with the icon letter and label of their pages. */
const kinds: Record<string, { letter: string; label: string; className: string }> = {
  classes: { letter: 'C', label: 'Class', className: 'bg-violet-500/15 text-violet-700 dark:text-violet-300' },
  functions: { letter: 'F', label: 'Function', className: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' },
  variables: { letter: 'V', label: 'Variable', className: 'bg-amber-500/15 text-amber-800 dark:text-amber-300' },
  interfaces: { letter: 'I', label: 'Interface', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
};

// a section's types.mdx holds its type aliases and Rels
const typesIcon = { letter: 'T', label: 'Types', className: 'bg-rose-500/15 text-rose-700 dark:text-rose-300' };

/** Kind of a reference page from its path, like `reference/admin/classes/API.mdx`. */
function kindOf(path: string) {
  const parts = path.split('/');
  if (parts[0] !== 'reference') return undefined;
  if (parts.at(-1) === 'types.mdx') return 'types';
  return parts.slice(0, -1).reverse().find(part => part in kinds);
}

function KindIcon({ kind }: { kind: string }) {
  const { letter, label, className } = kind === 'types' ? typesIcon : kinds[kind];
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] font-mono text-[10px] font-semibold leading-none ${className}`}
    >
      {letter}
    </span>
  );
}

const folderName = (node: PageTree.Folder) => node.$ref?.folder?.split('/').pop() ?? '';

/** A folder holding only its index page, like a namespace or `checkout/loader`, as a plain page link. */
const asPage = (node: PageTree.Node) => (node.type === 'folder' && node.index && !node.children.length ? node.index : node);

/** Flattens the kind folders of each reference section into one list sorted by name, and adds a kind icon to each page. */
export function referenceTreePlugin(): LoaderPlugin {
  return {
    name: 'foxy:reference-tree',
    transformPageTree: {
      file(node, path) {
        const kind = path && kindOf(path);
        return kind ? { ...node, icon: <KindIcon kind={kind} /> } : node;
      },
      folder(node) {
        const isKind = (child: PageTree.Node): child is PageTree.Folder =>
          child.type === 'folder' && folderName(child) in kinds;
        const first = node.children.findIndex(isKind);
        if (first === -1) return { ...node, children: node.children.map(asPage) };
        const flat = node.children
          .filter(isKind)
          .flatMap(folder => folder.children.map(asPage))
          .sort((a, b) => String(a.name).localeCompare(String(b.name), 'en', { sensitivity: 'base' }));
        const rest = node.children.filter(child => !isKind(child)).map(asPage);
        return { ...node, children: [...rest.slice(0, first), ...flat, ...rest.slice(first)] };
      },
    },
  };
}
