interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_FOXYCART_DOMAIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}