# i18n Implementation Plan (URL Prefix Approach)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add English/Chinese i18n support using Astro's built-in i18n routing with URL prefixes (`/en/` for English, `/zh/` for Chinese).

**Architecture:** Astro native i18n routing + translation files. Middleware handles root path browser language detection redirect. Static build generates HTML for all locale routes.

**Tech Stack:** Astro i18n routing, `Astro.currentLocale`, translation files, vanilla CSS/HTML.

---

## File Structure

```
src/
├── i18n/
│   ├── ui.ts          # Translation strings (en, zh)
│   └── utils.ts       # getLocale(), t() helpers
├── middleware.js      # Root path redirect + blog redirect
├── env.d.ts          # Astro.locals type
└── components/
    └── LanguageSwitcher.astro  # Language toggle link
```

---

## Task 1: Create i18n Translation Files

**Files:**
- Create: `src/i18n/ui.ts`
- Create: `src/i18n/utils.ts`

- [ ] **Step 1: Create `src/i18n/ui.ts`**

```typescript
export const ui = {
  en: {
    nav: {
      blog: "Blog",
      about: "About",
      skipToContent: "Skip to content",
      search: "Search",
    },
    pagination: {
      prev: "Prev",
      next: "Next",
    },
    footer: {
      viewSource: "View source on GitHub",
    },
    datetime: {
      published: "Published:",
      updated: "Updated:",
    },
    search: {
      placeholder: "Search posts...",
      noResults: "No results found",
    },
    notFound: {
      title: "Page Not Found",
      description: "The page you're looking for doesn't exist.",
    },
    card: {
      readingTime: "min read",
    },
  },
  zh: {
    nav: {
      blog: "博客",
      about: "关于",
      skipToContent: "跳转到内容",
      search: "搜索",
    },
    pagination: {
      prev: "上一页",
      next: "下一页",
    },
    footer: {
      viewSource: "在 GitHub 上查看源码",
    },
    datetime: {
      published: "发布于：",
      updated: "更新于：",
    },
    search: {
      placeholder: "搜索文章...",
      noResults: "未找到结果",
    },
    notFound: {
      title: "页面未找到",
      description: "您访问的页面不存在。",
    },
    card: {
      readingTime: "分钟阅读",
    },
  },
} as const;

export type Locale = keyof typeof ui;
export const defaultLocale: Locale = "en";
```

- [ ] **Step 2: Create `src/i18n/utils.ts`**

```typescript
import { ui, defaultLocale, type Locale } from "./ui";

export function getLocale(lang: string | undefined): Locale {
  if (lang && lang in ui) {
    return lang as Locale;
  }
  return defaultLocale;
}

export function t(locale: Locale, key: string): string {
  const keys = key.split(".");
  let value: unknown = ui[locale];
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  return typeof value === "string" ? value : key;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/ui.ts src/i18n/utils.ts
git commit -m "feat(i18n): add translation strings and utilities"
```

---

## Task 2: Update Astro Config and Middleware

**Files:**
- Modify: `astro.config.mjs`
- Modify: `src/middleware.js`
- Modify: `src/env.d.ts`

- [ ] **Step 1: Update `astro.config.mjs`**

Add i18n configuration inside `defineConfig`:

```javascript
i18n: {
  locales: ["en", "zh"],
  defaultLocale: "en",
  routing: {
    prefixDefaultLocale: false,
  },
  fallback: {
    zh: "en",
  },
},
```

- [ ] **Step 2: Update `src/env.d.ts`**

```typescript
/// <reference types="astro/client" />
```

(No changes needed - Astro.locals is already typed through Astro's types)

- [ ] **Step 3: Update `src/middleware.js`**

```javascript
export const onRequest = async (context, next) => {
  const url = new URL(context.request.url);

  // Redirect root to appropriate locale based on Accept-Language
  if (url.pathname === "/" || url.pathname === "") {
    const acceptLanguage = context.request.headers.get("accept-language") || "";
    const locale = acceptLanguage.toLowerCase().startsWith("zh") ? "zh" : "en";
    const targetPath = locale === "en" ? "/en/" : "/zh/";
    return context.redirect(targetPath, 302);
  }

  // Existing redirects
  if (url.pathname.startsWith("/blog/")) {
    return context.redirect("/posts/" + url.pathname.slice(6), 301);
  }
  if (url.pathname === "/blog" || url.pathname === "/blog/") {
    return context.redirect("/posts", 301);
  }

  return next();
};
```

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs src/middleware.js
git commit -m "feat(i18n): configure Astro i18n routing and middleware"
```

---

## Task 3: Create LanguageSwitcher Component

**Files:**
- Create: `src/assets/icons/IconGlobe.svg`
- Create: `src/components/LanguageSwitcher.astro`

- [ ] **Step 1: Create `src/assets/icons/IconGlobe.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"></circle>
  <line x1="2" y1="12" x2="22" y2="12"></line>
  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
</svg>
```

- [ ] **Step 2: Create `src/components/LanguageSwitcher.astro`**

```astro
---
import IconGlobe from "@/assets/icons/IconGlobe.svg";
import { defaultLocale } from "@/i18n/ui";

const currentLocale = Astro.currentLocale || defaultLocale;
const alternateLocale = currentLocale === "en" ? "zh" : "en";
const currentPath = Astro.url.pathname;

// Replace locale prefix in path
const alternatePath = currentPath.replace(/^\/(en|zh)\//, `/${alternateLocale}/`);
const alternateLabel = alternateLocale === "en" ? "English" : "中文";
const currentLabel = currentLocale === "en" ? "English" : "中文";
---

<a
  href={alternatePath}
  class="rounded-md p-2 text-gray-600 dark:text-gray-300 transition-colors hover:bg-secondary hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none"
  aria-label={`Switch to ${alternateLabel}`}
  title={`Switch to ${alternateLabel}`}
>
  <IconGlobe class="h-5 w-5" />
  <span class="sr-only">{alternateLabel}</span>
</a>
```

- [ ] **Step 3: Commit**

```bash
git add src/assets/icons/IconGlobe.svg src/components/LanguageSwitcher.astro
git commit -m "feat(i18n): add LanguageSwitcher component"
```

---

## Task 4: Integrate LanguageSwitcher into Header

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Add LanguageSwitcher after ThemeToggle**

Add import at top:
```astro
import LanguageSwitcher from "./LanguageSwitcher.astro";
```

Add LanguageSwitcher after the ThemeToggle `</li>`:
```astro
<li class="col-span-1 flex items-center justify-center">
  <LanguageSwitcher />
</li>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat(i18n): integrate LanguageSwitcher in Header"
```

---

## Task 5: Update Components to Use Translations

**Files:**
- Modify: `src/components/Datetime.astro`
- Modify: `src/components/Pagination.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/components/Header.astro`
- Modify: `src/pages/404.astro`

- [ ] **Step 1: Update `src/components/Datetime.astro`**

Add imports:
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";
```

Get current locale:
```astro
const locale = Astro.currentLocale || defaultLocale;
const publishedLabel = t(locale, "datetime.published");
const updatedLabel = t(locale, "datetime.updated");
```

Replace hardcoded "Published:" and "Updated:" with `{publishedLabel}` and `{updatedLabel}`.

- [ ] **Step 2: Update `src/components/Pagination.astro`**

Add imports:
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";
```

Get locale and translate:
```astro
const locale = Astro.currentLocale || defaultLocale;
```

Replace "Prev" → `{t(locale, "pagination.prev")}` and "Next" → `{t(locale, "pagination.next")}`.

- [ ] **Step 3: Update `src/components/Footer.astro`**

Add imports:
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";
```

Get locale and translate:
```astro
const locale = Astro.currentLocale || defaultLocale;
```

Replace "View source on GitHub" → `{t(lang, "footer.viewSource")}`.

- [ ] **Step 4: Update `src/components/Header.astro`**

Add imports and translate nav items:
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";

const locale = Astro.currentLocale || defaultLocale;
```

Replace:
- "Posts" → `{t(locale, "nav.blog")}`
- "About" → `{t(locale, "nav.about")}`
- "Skip to content" → `{t(locale, "nav.skipToContent")}`
- Search sr-only text → `{t(locale, "nav.search")}`

- [ ] **Step 5: Update `src/pages/404.astro`**

Add imports:
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";
```

Get locale and translate:
```astro
const locale = Astro.currentLocale || defaultLocale;
```

Replace title and description with `{t(locale, "notFound.title")}` and `{t(locale, "notFound.description")}`.

- [ ] **Step 6: Commit**

```bash
git add src/components/Datetime.astro src/components/Pagination.astro src/components/Footer.astro src/components/Header.astro src/pages/404.astro
git commit -m "feat(i18n): update components to use translations"
```

---

## Task 6: Update Pages with Translations

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/posts/index.astro`
- Modify: `src/pages/search.astro`
- Modify: `src/pages/about.md.ts`

- [ ] **Step 1: Update `src/pages/index.astro`**

Add imports and get locale:
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";

const locale = Astro.currentLocale || defaultLocale;
```

Find and replace hardcoded English text:
- "All Posts" / "Featured" / Hero section text → use `t(locale, "...")`
- Month names like "March" in date formatting should be handled by `Datetime` component (already translated)

- [ ] **Step 2: Update `src/pages/posts/index.astro`**

Add imports and get locale:
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";

const locale = Astro.currentLocale || defaultLocale;
```

Translate page title and description.

- [ ] **Step 3: Update `src/pages/search.astro`**

Add imports and get locale:
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";

const locale = Astro.currentLocale || defaultLocale;
```

Replace placeholder text with `{t(locale, "search.placeholder")}`.

Note: Pagefind UI itself cannot be translated easily - it's loaded from CDN. The placeholder text we control will be translated.

- [ ] **Step 4: Update `src/pages/about.md.ts`**

This page uses a markdown layout. Add frontmatter translation if needed.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/pages/posts/index.astro src/pages/search.astro src/pages/about.md.ts
git commit -m "feat(i18n): update pages with translations"
```

---

## Task 7: Update Layout for SEO hreflang

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Add hreflang tags**

After the `<head>` opening, add hreflang alternates:

```astro
<link rel="alternate" hreflang="en" href={new URL(Astro.url.pathname.replace(/^\/zh\//, "/en/"), Astro.url)} />
<link rel="alternate" hreflang="zh" href={new URL(Astro.url.pathname.replace(/^\/en\//, "/zh/"), Astro.url)} />
```

Update html lang attribute:
```astro
<html lang={Astro.currentLocale || "en"}>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat(i18n): add hreflang tags for SEO"
```

---

## Task 8: Verify Build

- [ ] **Step 1: Run build check**

```bash
npm run build:check
```

Expected: Build completes without errors.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No lint errors.

---

## Summary

| Task | Files | Description |
|------|-------|-------------|
| 1 | ui.ts, utils.ts | Translation strings and helpers |
| 2 | astro.config.mjs, middleware.js | Astro i18n routing config |
| 3 | LanguageSwitcher.astro, IconGlobe.svg | Toggle button |
| 4 | Header.astro | Integrate toggle in nav |
| 5 | Datetime, Pagination, Footer, Header, 404 | Use t() for UI text |
| 6 | index, posts, search, about pages | Page text translations |
| 7 | Layout.astro | hreflang SEO tags |
| 8 | - | Verify build |
