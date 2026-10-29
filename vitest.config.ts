import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/*.d.ts'],
      include: ['src/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    environment: 'node',
    // Node 25+ ships its own localStorage, which hides jsdom's in the jsdom tests
    execArgv: ['--no-experimental-webstorage'],
    globals: true,
    include: ['src/tests/**/*.test.ts'],
    setupFiles: ['src/tests/setup.ts'],
  },
});
