# Vitest Testing Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vitest testing framework with React component testing, utility function testing, Astro component testing, and GitHub Actions CI integration.

**Architecture:** Use `getViteConfig()` to inherit Astro's existing Vite configuration. Layer tests: jsdom for React components via `environmentMatchGlobs`, node for utilities and Astro components. Test files live in `__tests__/` root directory (outside `src/`).

**Tech Stack:** vitest, jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, @vitest/coverage-v8

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/coverage-v8
```

- [ ] **Step 2: Verify installation**

```bash
npm list vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```
Expected: All packages show versions

---

## Task 2: Create Test Setup File

**Files:**
- Create: `__tests__/setup.ts`

- [ ] **Step 1: Create setup file with jest-dom matchers**

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Commit**

```bash
git add __tests__/setup.ts
git commit -m "test: add __tests__/setup.ts with jest-dom matchers"
```

---

## Task 3: Create vitest.config.ts

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Write vitest config using getViteConfig()**

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

- [ ] **Step 2: Commit**

```bash
git add vitest.config.ts
git commit -m "test: add vitest.config.ts using getViteConfig()"
```

---

## Task 4: Add npm Scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add test scripts to package.json**

Add to `scripts` section:

```json
"test": "vitest",
"test:run": "vitest run",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 2: Verify scripts work**

```bash
npm run test:run -- --version
```
Expected: vitest version output

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "test: add npm scripts for vitest"
```

---

## Task 5: Write Test for getPath Utility

**Files:**
- Create: `__tests__/utils/getPath.test.ts`
- Test: `src/utils/getPath.ts`

- [ ] **Step 1: Write failing test**

```typescript
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

- [ ] **Step 2: Run test to verify it works**

```bash
npm run test:run -- __tests__/utils/getPath.test.ts
```
Expected: Tests pass

- [ ] **Step 3: Commit**

```bash
git add __tests__/utils/getPath.test.ts
git commit -m "test: add getPath utility tests"
```

---

## Task 6: Write Test for MobileMenu Component

**Files:**
- Create: `__tests__/components/ui/mobile-menu.test.tsx`
- Test: `src/components/ui/mobile-menu.tsx`

- [ ] **Step 1: Write failing test**

```typescript
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

- [ ] **Step 2: Run test to verify it works**

```bash
npm run test:run -- __tests__/components/ui/mobile-menu.test.tsx
```
Expected: Tests pass

- [ ] **Step 3: Commit**

```bash
git add __tests__/components/ui/mobile-menu.test.tsx
git commit -m "test: add MobileMenu component tests"
```

---

## Task 7: Write Minimal Test for Layout Component

**Files:**
- Create: `__tests__/layouts/Layout.test.ts`
- Test: `src/layouts/Layout.astro`

- [ ] **Step 1: Write minimal test to verify Container API works**

```typescript
import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Layout from "@/layouts/Layout.astro";

describe("Layout", () => {
  it("renders html lang attribute", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Layout);
    expect(result).toContain('<html lang="en"');
  });
});
```

- [ ] **Step 2: Run test to verify it works**

```bash
npm run test:run -- __tests__/layouts/Layout.test.ts
```
Expected: Test passes

If test fails with `Astro.url` or `Astro.currentLocale` errors, note the issue and proceed to Task 8 to add request/renderer configuration.

- [ ] **Step 3: Commit**

```bash
git add __tests__/layouts/Layout.test.ts
git commit -m "test: add Layout component smoke test"
```

---

## Task 8: Fix Layout Test if Needed (Conditional)

**Files:**
- Modify: `__tests__/layouts/Layout.test.ts`

If Task 7 fails due to `Astro.url` or `Astro.currentLocale` errors:

- [ ] **Step 1: Update Layout test with request configuration**

```typescript
import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getContainerRenderer as reactContainerRenderer } from "@astrojs/react";
import { loadRenderers } from "astro:container";
import Layout from "@/layouts/Layout.astro";

describe("Layout", () => {
  it("renders html lang attribute", async () => {
    const renderers = await loadRenderers([reactContainerRenderer()]);
    const container = await AstroContainer.create({ renderers });
    const result = await container.renderToString(Layout, {
      request: new Request("https://example.com/"),
    });
    expect(result).toContain('<html lang="en"');
  });
});
```

- [ ] **Step 2: Run test to verify it works**

```bash
npm run test:run -- __tests__/layouts/Layout.test.ts
```
Expected: Test passes

- [ ] **Step 3: Commit if modified**

```bash
git add __tests__/layouts/Layout.test.ts
git commit -m "test: add request config to Layout test for Astro runtime context"
```

---

## Task 9: Create GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/test.yml`

- [ ] **Step 1: Create test workflow**

```yaml
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

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/test.yml
git commit -m "ci: add test workflow to GitHub Actions"
```

---

## Task 10: Verify Full Test Suite

**Files:**
- None (verification only)

- [ ] **Step 1: Run all tests**

```bash
npm run test:run
```
Expected: All tests pass

- [ ] **Step 2: Verify build still works**

```bash
npm run build
```
Expected: Build completes without errors

- [ ] **Step 3: Run lint to ensure no regressions**

```bash
npm run lint
```
Expected: No lint errors

---

## Summary

| Task | Files | Description |
|------|-------|-------------|
| 1 | package.json | Install dependencies |
| 2 | __tests__/setup.ts | Setup file with jest-dom |
| 3 | vitest.config.ts | Vitest configuration |
| 4 | package.json | Add npm scripts |
| 5 | __tests__/utils/getPath.test.ts | Utility function test |
| 6 | __tests__/components/ui/mobile-menu.test.tsx | React component test |
| 7 | __tests__/layouts/Layout.test.ts | Astro component smoke test |
| 8 | __tests__/layouts/Layout.test.ts (conditional) | Fix Layout test if needed |
| 9 | .github/workflows/test.yml | CI workflow |
| 10 | - | Verify everything works |
