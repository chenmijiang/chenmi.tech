# Testing Framework Design - Vitest

Date: 2026-03-22
Status: Draft

## Overview

Add Vitest-based testing framework to enable regression testing for utility functions, React components, Astro components, and page layouts.

## Tech Stack

| Package | Purpose |
|---------|---------|
| `vitest` | Test runner and assertion library |
| `@astrojs/test` | Astro component testing |
| `@testing-library/react` | React component DOM testing |
| `@testing-library/jest-dom` | Extended DOM assertions |

## Directory Structure

```
chenmi.tech/
├── __tests__/                    # Test root directory
│   ├── utils/                    # Mirror of src/utils/
│   │   └── formatDate.test.ts
│   ├── components/               # Mirror of src/components/
│   │   └── ui/
│   │       └── Button.test.tsx
│   ├── layouts/                  # Mirror of src/layouts/
│   │   └── BaseLayout.test.ts
│   └── pages/                    # Mirror of src/pages/
│       └── index.test.ts
├── vitest.config.ts
└── src/                          # Source code (no test files)
```

## Configuration

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  test: {
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['src/**'],
    environment: 'node',
    globals: true,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### Environment

- Node.js 20+ (matches CI configuration)
- ESM modules (`"type": "module"` in package.json)

## Test Types

### 1. Utility Functions

Location: `__tests__/utils/*.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/utils/formatDate';

describe('formatDate', () => {
  it('formats date correctly', () => {
    expect(formatDate('2026-03-22')).toBe('March 22, 2026');
  });
});
```

### 2. React Components

Location: `__tests__/components/ui/*.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });
});
```

### 3. Astro Components

Location: `__tests__/layouts/*.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { getComponentOutput } from '@astrojs/test';
import { BaseLayout } from '@/layouts/BaseLayout.astro';

describe('BaseLayout', () => {
  it('renders layout', async () => {
    const output = await getComponentOutput(BaseLayout);
    expect(output.code).toContain('<html');
  });
});
```

### 4. Page Layouts

Location: `__tests__/pages/*.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { getPageOutput } from '@astrojs/test';
import Index from '@/pages/index.astro';

describe('Index page', () => {
  it('renders without errors', async () => {
    const output = await getPageOutput(Index);
    expect(output.code).toContain('<main');
  });
});
```

## npm Scripts

```json
{
  "test": "vitest",
  "test:run": "vitest run",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

## Build Exclusion

Test files are excluded from production build by:
- Vitest `include` pattern: `__tests__/**`
- Vitest `exclude` pattern: `src/**`
- `.gitignore` already ignores `dist/` and `node_modules/`

## CI Integration (Deferred)

No immediate CI integration. Future step will add test job to `.github/workflows/` parallel to existing `build` and `lint` jobs.

## Success Criteria

1. `npm run test` runs all tests without errors
2. Test files in `__tests__/` are not included in production build
3. TypeScript types are correctly resolved via `@/` alias
4. Existing `npm run build` continues to work

## Out of Scope

- E2E testing (Playwright)
- Snapshot testing
- Performance benchmarking
- TDD workflow setup
