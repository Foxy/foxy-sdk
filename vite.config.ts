import { builtinModules } from "module";
import { defineConfig } from "vite";
import { resolve } from "path";

import pluginExternal from "vite-plugin-external";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

type PackageJsonWithDeps = {
  dependencies?: Record<string, string>;
};

const builtins = new Set([
  ...builtinModules,
  ...builtinModules.map((name) => `node:${name}`),
]);

const entryMap = {
  index: resolve(__dirname, "src/index.ts"),
  checkout: resolve(__dirname, "src/checkout/index.ts"),
  "checkout/client": resolve(__dirname, "src/checkout/client.ts"),
  "checkout/loader": resolve(__dirname, "src/checkout/loader.ts"),
};

function isExternal(id: string): boolean {
  return builtins.has(id);
}

export default defineConfig(({ mode }) => {
  const isCDN = mode === "cdn";
  const dependencies = Object.keys(
    (pkg as PackageJsonWithDeps).dependencies ?? {},
  );

  return {
    plugins: isCDN
      ? []
      : [
          pluginExternal({
            externalizeDeps: dependencies,
            nodeBuiltins: true,
          }),
          dts({
            outDir: "dist/npm",
            rollupTypes: true,
            tsconfigPath: "./tsconfig.build.json",
            include: ["src/index.ts", "src/checkout"],
            exclude: [
              "src/tests/**",
              "src/**/__tests__/**",
              "src/**/*.test.ts",
              "src/**/*.spec.ts",
            ],
          }),
        ],
    build: {
      emptyOutDir: true,
      sourcemap: true,
      license: isCDN && { fileName: "LICENSE.md" },
      minify: isCDN,
      outDir: isCDN ? "dist/cdn" : "dist/npm",
      lib: { entry: entryMap, formats: ["es"] },
      rollupOptions: {
        external: isCDN ? isExternal : undefined,
        output: {
          format: "es",
          preserveModules: false,
          postBanner: isCDN
            ? "/* See licenses of bundled dependencies in LICENSE.md */"
            : undefined,
        },
      },
    },
  };
});
