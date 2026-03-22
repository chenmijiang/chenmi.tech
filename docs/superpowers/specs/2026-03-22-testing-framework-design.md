# Testing Framework Design - Vitest

Date: 2026-03-22
Status: Draft

## Overview

Add Vitest-based testing framework to enable regression testing for utility functions, React components, Astro components, and page layouts.

## Tech Stack

| Package | Purpose |
|---------|---------|
| `vitest` | Test runner and assertion library |
| `jsdom` | DOM environment for React component tests |
| `@testing-library/react` | React component DOM testing |
| `@testing-library/jest-dom` | Extended DOM assertions |
| `@testing-library/user-event` | Simulate user interactions for React tests |
| `@vitest/coverage-v8` | Code coverage reporting |

## Directory Structure

```
chenmi.tech/
├── __tests__/                    # Test root directory (outside src/)
│   ├── utils/
│   │   └── getPath.test.ts      # Tests for src/utils/getPath.ts
│   ├── components/
│   │   └── ui/
│   │       └── mobile-menu.test.tsx  # Tests for src/components/ui/mobile-menu.tsx
│   └── layouts/
│       └── Layout.test.ts        # Tests for src/layouts/Layout.astro
├── __tests__/setup.ts           # Test setup file (jest-dom matchers, etc.)
├── vitest.config.ts
└── src/                          # Source code (no test files)
```

## Configuration

### vitest.config.ts

```typescript
/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    include: ["__tests__/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["src/**"],
    globals: true,
    setupFiles: ["__tests__/setup.ts"],
    environmentMatchGlobs: [
      ["__tests__/components/**/*.{ts,tsx}", "jsdom"],
    ],
  },
});
```

**Environment strategy:**

- `jsdom` — React component tests (`__tests__/components/**`)
- `node` (default) — Utility function tests, Astro component tests

**Key design decisions:**

1. **`getViteConfig()` from `astro/config`** — Reuses existing Astro configuration (alias `@/` → `src/`, Tailwind, etc.) instead of duplicating config manually. This ensures test environment matches production build.

2. **`setupFiles`** — Points to `__tests__/setup.ts` which registers `@testing-library/jest-dom` matchers globally.

3. **`exclude: ["src/**"]`** — Explicitly excludes `src/` from test discovery. Tests live in `__tests__/`, not alongside source files.

### __tests__/setup.ts

```typescript
import "@testing-library/jest-dom/vitest";
```

This registers custom jest-dom matchers (e.g., `toBeInTheDocument()`, `toHaveTextContent()`) globally.

## Required Dependencies

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/coverage-v8
```

## Test Layering

Tests are organized by type with appropriate environments:

| Layer | Location | Environment | Tool |
|-------|----------|--------------|------|
| Utility functions | `__tests__/utils/*.test.ts` | node | Vitest assertions |
| React components | `__tests__/components/ui/*.test.tsx` | jsdom | @testing-library/react |
| Astro components | `__tests__/layouts/*.test.ts` | node + Container API | Vitest + astro/container |

## Example Tests

### 1. Utility Function

**Target:** `src/utils/getPath.ts`

```typescript
// __tests__/utils/getPath.test.ts
import { describe, it, expect } from "vitest";
import { getPath } from "@/utils/getPath";

describe("getPath", () => {
  it("returns base path when no filePath", () => {
    const result = getPath("my-post", undefined);
    expect(result).toBe("/posts/my-post");
  });

  it("returns path with segments from filePath", () => {
    const result = getPath("my-post", "src/content/blog/tech/my-post.md");
    expect(result).toBe("/posts/tech/my-post");
  });

  it("excludes underscore-prefixed directories", () => {
    const result = getPath("my-post", "src/content/blog/_drafts/my-post.md");
    expect(result).toBe("/posts/my-post");
  });
});
```

### 2. React Component

**Target:** `src/components/ui/mobile-menu.tsx`

```typescript
// __tests__/components/ui/mobile-menu.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MobileMenu from "@/components/ui/mobile-menu";

describe("MobileMenu", () => {
  it("renders toggle button", () => {
    render(<MobileMenu />);
    expect(screen.getByRole("button", { name: /toggle menu/i })).toBeInTheDocument();
  });

  it("shows menu when opened", async () => {
    const user = userEvent.setup();
    render(<MobileMenu />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
```

### 3. Astro Component

**Target:** `src/layouts/Layout.astro`

Uses `experimental_AstroContainer` from `astro/container` (Astro's official testing API):

```typescript
// __tests__/layouts/Layout.test.ts
import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Layout from "@/layouts/Layout.astro";

describe("Layout", () => {
  it("renders html lang attribute", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Layout);
    expect(result).toContain('<html lang="en"');
  });

  it("renders slot content", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Layout, {
      slots: { default: "<main>Test content</main>" },
    });
    expect(result).toContain("Test content");
  });
});
```

**Note:** The Container API is experimental (`astro@4.9.0+`). Verify API compatibility when upgrading Astro.

## npm Scripts

```json
{
  "test": "vitest",
  "test:run": "vitest run",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

## CI Integration

Tests run in GitHub Actions on every push and PR:

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "20"

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:run
```

## Build Exclusion

Test files are excluded from production build because:

1. **Location** — Tests are in `__tests__/` (root), outside Astro's source directory `src/`. Astro's build only includes `src/` by default.
2. **No entry point** — Test files are never imported by source files; they are leaf nodes in the dependency graph.
3. **Vitest discovery** — `include` and `exclude` patterns in `vitest.config.ts` only affect test file discovery, not the production build.

## Success Criteria

1. `npm run test` runs all tests without errors
2. `npm run test:run` passes in CI (GitHub Actions)
3. Test files in `__tests__/` are not included in production build
4. TypeScript types are correctly resolved via `@/` alias
5. Existing `npm run build` continues to work

## Out of Scope

- E2E testing (Playwright)
- Snapshot testing
- Performance benchmarking
- TDD workflow setup
- `@astrojs/test` package (not needed — using astro/container directly)
