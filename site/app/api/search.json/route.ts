import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Static export: the search index is built once at build time.
export const revalidate = false;

// The `.json` name gives the exported file a JSON content type, so hosts compress it.
// Sort tables are a third of the index and search never uses them.
export const { staticGET: GET } = createFromSource(source, { sort: { enabled: false } });
