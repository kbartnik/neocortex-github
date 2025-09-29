import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,ts}", "test/**/*.{test,spec}.{js,ts}"],
      coverage: {
          reporter: ["text", "html"],
          exclude: [
              "node_modules/",
              "dist/",
              "coverage/",
              "**/*.config.{js,ts}",    // All config files
              "**/*.d.ts",              // Type declaration files
              "**/test/**",             // Test files
              "**/*.test.{js,ts}",      // Test files in src
              "**/*.spec.{js,ts}",      // Spec files
          ],
      },
    watch: false,
  },
});
