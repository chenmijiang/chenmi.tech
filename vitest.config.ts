/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    include: ["__tests__/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["src/**"],
    globals: true,
    setupFiles: ["__tests__/setup.ts"],
    environment: "jsdom",
  },
});
