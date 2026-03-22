# Vitest Testing Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vitest testing framework with utility function testing, React component testing, and GitHub Actions CI integration. (Astro component testing deferred to Phase 2)

**Architecture:** Use `getViteConfig()` to inherit Astro's existing Vite configuration. Layer tests: jsdom for React components via `environmentMatchGlobs`, node for utility function tests. Test files live in `__tests__/` root directory (outside `src/`).

**Tech Stack:** vitest, jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, @vitest/coverage-v8

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/coverage-v8
```

- [ ] **Step 2: Verify installation**

```bash
npm list vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```
Expected: All packages show versions

- [ ] **Step 3: Commit (include lockfile)**

```bash
git add package.json package-lock.json
git commit -m "deps: add vitest and testing libraries"
```

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
"test:coverage": "vitest run --coverage"
```

Note: `test:ui` is omitted — it requires `@vitest/ui` package. Add later if needed.

- [ ] **Step 2: Verify scripts work**

```bash
npx vitest --version
```
Expected: vitest version output (e.g., "vitest v2.x.x")

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

## Task 7: Update GitHub Actions to Run Tests

**Files:**
- Modify: `.github/workflows/astro-build.yml`

- [ ] **Step 1: Add test job to existing workflow**

Add a `test` job that runs before `build`:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
      - run: npm ci
      - run: npm run test:run

  build:
    needs: test
    # ... existing build steps
```

- [ ] **Step 2: Verify locally that CI changes work**

```bash
npm run test:run
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/astro-build.yml
git commit -m "ci: add test job to existing GitHub Actions workflow"
```

---

## Task 8: Verify Full Test Suite

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

- [ ] **Step 3: Verify vitest config loads correctly**

```bash
npm run test:run -- --run --passWithNoTests
```
Expected: Tests collected (0 tests if no test files yet), no config errors

- [ ] **Step 4: Run lint on new test files**

```bash
npx biome check __tests__/
```
Expected: No lint errors (biome will be configured separately if needed)

Note: `npm run lint` only checks `src/` directory. Test files and config files are verified via `npm run test:run` which validates syntax and imports at runtime.

---

## Summary

| Task | Files | Description |
|------|-------|-------------|
| 1 | package.json, package-lock.json | Install dependencies |
| 2 | __tests__/setup.ts | Setup file with jest-dom |
| 3 | vitest.config.ts | Vitest configuration |
| 4 | package.json | Add npm scripts |
| 5 | __tests__/utils/getPath.test.ts | Utility function test |
| 6 | __tests__/components/ui/mobile-menu.test.tsx | React component test |
| 7 | .github/workflows/astro-build.yml | Add test job to CI |
| 8 | - | Verify everything works |

**Deferred:**
- Astro Layout component testing — requires Astro runtime context, cannot be reliably unit tested
