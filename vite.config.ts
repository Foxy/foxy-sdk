import { builtinModules } from "module";
import { defineConfig } from "vite";
import { resolve } from "path";

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
  admin: resolve(__dirname, "src/admin/index.ts"),
  checkout: resolve(__dirname, "src/checkout/index.ts"),
  "checkout/client": resolve(__dirname, "src/checkout/client.ts"),
  "checkout/loader": resolve(__dirname, "src/checkout/loader.ts"),
  core: resolve(__dirname, "src/core/index.ts"),
  customer: resolve(__dirname, "src/customer/index.ts"),
};

function isExternal(id: string): boolean {
  return builtins.has(id);
}

function isDependencyExternal(id: string, deps: string[]): boolean {
  return deps.some((dep) => id === dep || id.startsWith(`${dep}/`));
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
          dts({
            outDir: "dist/npm",
            copyDtsFiles: true,
            insertTypesEntry: true,
            rollupTypes: false,
            tsconfigPath: "./tsconfig.build.json",
            include: [
              "src/index.ts",
              "src/admin",
              "src/checkout",
              "src/core",
              "src/customer",
              "src/rules",
              "src/vite-env.d.ts",
            ],
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
        external: (id) => {
          if (isCDN) return isExternal(id);
          return isExternal(id) || isDependencyExternal(id, dependencies);
        },
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
