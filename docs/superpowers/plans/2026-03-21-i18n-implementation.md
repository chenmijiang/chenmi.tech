# i18n Implementation Plan (URL Prefix Approach)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add English/Chinese i18n support using Astro's built-in i18n routing with URL prefixes (`/en/` for English default, `/zh/` for Chinese).

**Architecture:** 
- `prefixDefaultLocale: false` - English has no prefix, Chinese uses `/zh/`
- All internal links generated via `getRelativeLocaleUrl(locale, path)`
- Static build generates HTML for all locale routes

**Tech Stack:** Astro i18n routing, `Astro.currentLocale`, `getRelativeLocaleUrl`, translation files.

---

## File Structure

```
src/
├── i18n/
│   ├── ui.ts          # Translation strings (en, zh)
│   └── utils.ts       # getLocalePath() for post URLs
├── middleware.js      # Root path redirect + blog redirect
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

export function getCurrentLocale(locale: string | undefined): Locale {
  return (locale && locale in { en: true, zh: true })
    ? (locale as Locale)
    : defaultLocale;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/ui.ts src/i18n/utils.ts
git commit -m "feat(i18n): add translation strings and t() utility"
```

---

## Task 2.5: Update getPath Utility (if needed)

**Files:**
- Modify: `src/utils/getPath.ts`

- [ ] **Step 1: Review getPath usage**

Check if `getPath()` is used directly in components that need locale-aware URLs. If so, those usages should be updated to prepend locale prefix manually using `getRelativeLocaleUrl()`.

Note: The plan tasks handle updating individual component usages of `getPath()` by wrapping results with locale prefix.

- [ ] **Step 2: Commit**

```bash
git add src/utils/getPath.ts
git commit -m "refactor(i18n): ensure getPath returns consistent paths"
```

---

## Task 2: Configure Astro i18n and Middleware

**Files:**
- Modify: `astro.config.mjs`
- Modify: `src/middleware.js`

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

- [ ] **Step 2: Update `src/middleware.js`**

```javascript
export const onRequest = async (context, next) => {
  const url = new URL(context.request.url);

  // Redirect root to Chinese if browser prefers zh, else stay on English root
  if (url.pathname === "/" || url.pathname === "") {
    const acceptLanguage = context.request.headers.get("accept-language") || "";
    if (acceptLanguage.toLowerCase().startsWith("zh")) {
      return context.redirect("/zh/", 302);
    }
    // English root - don't redirect
    return next();
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

- [ ] **Step 3: Commit**

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
import { getRelativeLocaleUrl, type Locale } from "astro:i18n";
import { defaultLocale } from "@/i18n/ui";

const currentLocale = (Astro.currentLocale || defaultLocale) as Locale;
const alternateLocale: Locale = currentLocale === "en" ? "zh" : "en";

// Get current path without locale prefix
const currentPath = Astro.url.pathname.replace(/^\/(en|zh)\//, "/");
const alternatePath = getRelativeLocaleUrl(alternateLocale, currentPath.slice(1));
const alternateLabel = alternateLocale === "en" ? "English" : "中文";
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

## Task 4: Update Header with Locale-Aware Links

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Update Header imports and locale handling**

Add imports:
```astro
import { getRelativeLocaleUrl, type Locale } from "astro:i18n";
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";
import LanguageSwitcher from "./LanguageSwitcher.astro";
```

Add locale variable:
```astro
const locale = (Astro.currentLocale || defaultLocale) as Locale;
const currentPath = Astro.url.pathname.replace(/^\/(en|zh)\//, "/");
```

Replace hardcoded nav links with locale-aware versions:
- `/posts` → `{getRelativeLocaleUrl(locale, "posts")}`
- `/about` → `{getRelativeLocaleUrl(locale, "about")}`
- `/search` → `{getRelativeLocaleUrl(locale, "search")}`

Replace hardcoded text:
- "Posts" → `{t(locale, "nav.blog")}`
- "About" → `{t(locale, "nav.about")}`
- "Skip to content" → `{t(locale, "nav.skipToContent")}`
- Search sr-only → `{t(locale, "nav.search")}`

Add LanguageSwitcher after ThemeToggle `</li>`:
```astro
<li class="col-span-1 flex items-center justify-center">
  <LanguageSwitcher />
</li>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat(i18n): update Header with locale-aware links"
```

---

## Task 5: Update Footer and Datetime Components

**Files:**
- Modify: `src/components/Footer.astro`
- Modify: `src/components/Datetime.astro`

- [ ] **Step 1: Update `src/components/Footer.astro`**

Add imports:
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";
```

Add locale:
```astro
const locale = (Astro.currentLocale || defaultLocale) as Locale;
```

Replace "View source on GitHub" → `{t(locale, "footer.viewSource")}`.

- [ ] **Step 2: Update `src/components/Datetime.astro`**

Add imports:
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";
```

Add locale:
```astro
const locale = (Astro.currentLocale || defaultLocale) as Locale;
const publishedLabel = t(locale, "datetime.published");
const updatedLabel = t(locale, "datetime.updated");
```

Replace hardcoded "Published:" and "Updated:" with `{publishedLabel}` and `{updatedLabel}`.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro src/components/Datetime.astro
git commit -m "feat(i18n): update Footer and Datetime components"
```

---

## Task 6: Update Pagination Component

**Files:**
- Modify: `src/components/Pagination.astro`

- [ ] **Step 1: Update Pagination with locale-aware URLs**

Add imports:
```astro
import { getRelativeLocaleUrl, type Locale } from "astro:i18n";
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";
```

Add locale:
```astro
const locale = (Astro.currentLocale || defaultLocale) as Locale;
```

Replace:
- "Prev" → `{t(locale, "pagination.prev")}`
- "Next" → `{t(locale, "pagination.next")}`
- `href={page.url.prev as string}` → `href={getRelativeLocaleUrl(locale, page.url.prev.toString().replace(/^\/(en|zh)\//, "/"))}`
- `href={page.url.next as string}` → similar pattern

- [ ] **Step 2: Commit**

```bash
git add src/components/Pagination.astro
git commit -m "feat(i18n): update Pagination with locale-aware links"
```

---

## Task 7: Update Card and BackButton Components

**Files:**
- Modify: `src/components/Card.astro`
- Modify: `src/components/BackButton.astro`

- [ ] **Step 1: Update `src/components/Card.astro`**

The Card component uses `getPath()` for links. Need to update to use locale-aware path.

Add imports:
```astro
import { getRelativeLocaleUrl, type Locale } from "astro:i18n";
import { defaultLocale } from "@/i18n/ui";
import { t } from "@/i18n/utils";
import { getPath } from "@/utils/getPath";
```

Add locale and translate readingTime:
```astro
const locale = (Astro.currentLocale || defaultLocale) as Locale;
const readingTimeText = t(locale, "card.readingTime");
```

Update link href: currently uses `getPath(id, filePath)`, needs to become locale-aware. The post path from getPath needs locale prefix for zh.

Create locale-aware path:
```astro
const postPath = getPath(id, filePath);
const localePostPath = locale === defaultLocale 
  ? postPath 
  : getRelativeLocaleUrl(locale, postPath.replace(/^\//, ""));
```

Replace `href={getPath(id, filePath)}` with `href={localePostPath}`.

Replace "min read" text with `{readingTimeText}`.

- [ ] **Step 2: Update `src/components/BackButton.astro`**

Check if BackButton has hardcoded links. If so, make locale-aware.

- [ ] **Step 3: Commit**

```bash
git add src/components/Card.astro src/components/BackButton.astro
git commit -m "feat(i18n): update Card and BackButton components"
```

---

## Task 8: Update PostDetails Layout

**Files:**
- Modify: `src/layouts/PostDetails.astro`

- [ ] **Step 1: Update PostDetails with locale-aware links**

Add imports:
```astro
import { getRelativeLocaleUrl, type Locale } from "astro:i18n";
import { defaultLocale } from "@/i18n/ui";
import { getPath } from "@/utils/getPath";
```

Add locale:
```astro
const locale = (Astro.currentLocale || defaultLocale) as Locale;
```

Update prev/next post links:
- Current: `href={prevPost ? `/posts/${prevPost.slug}` : ''}`
- New: Use `getRelativeLocaleUrl(locale, `posts/${prevPost.slug.replace(/.*\//, "")}`)}`

Update back-to-top href if needed.

- [ ] **Step 2: Commit**

```bash
git add src/layouts/PostDetails.astro
git commit -m "feat(i18n): update PostDetails with locale-aware links"
```

---

## Task 9: Update Pages with Locale-Aware Links

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/posts/index.astro`
- Modify: `src/pages/search.astro`
- Modify: `src/pages/404.astro`
- Modify: `src/pages/about.md.ts`

- [ ] **Step 1: Update `src/pages/index.astro`**

Add imports:
```astro
import { getRelativeLocaleUrl, type Locale } from "astro:i18n";
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";
```

Add locale:
```astro
const locale = (Astro.currentLocale || defaultLocale) as Locale;
```

Update links:
- `/about` → `{getRelativeLocaleUrl(locale, "about")}`
- `/posts` → `{getRelativeLocaleUrl(locale, "posts")}`
- `/rss.xml` → `/rss.xml` (RSS doesn't need locale prefix)

Update hardcoded text ("Featured", "All Posts", "RSS Feed") to use t().

- [ ] **Step 2: Update `src/pages/posts/index.astro`**

Add imports and locale, update page title/description if hardcoded.

- [ ] **Step 3: Update `src/pages/search.astro`**

Add imports and locale, update placeholder text.

- [ ] **Step 4: Update `src/pages/404.astro`**

Add imports and locale, update title/description.

- [ ] **Step 5: Update `src/pages/about.md.ts`**

Check if about page has any hardcoded links or text.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro src/pages/posts/index.astro src/pages/search.astro src/pages/404.astro src/pages/about.md.ts
git commit -m "feat(i18n): update pages with locale-aware links"
```

---

## Task 10: Update Layout for SEO

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Update Layout with hreflang and html lang**

Update html tag:
```astro
<html lang={Astro.currentLocale || "en"}>
```

Add hreflang alternates in `<head>`:
```astro
{(() => {
  const pathname = Astro.url.pathname;
  const enPath = pathname.replace(/^\/zh\//, "/");
  const zhPath = pathname.startsWith("/zh/") 
    ? pathname 
    : `/zh${pathname}`;
  return (
    <>
      <link rel="alternate" hreflang="en" href={new URL(enPath, Astro.url)} />
      <link rel="alternate" hreflang="zh" href={new URL(zhPath, Astro.url)} />
    </>
  );
})()}
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat(i18n): add hreflang tags and html lang to Layout"
```

---

## Task 11: Update RSS Feed

**Files:**
- Modify: `src/pages/rss.xml.ts`

- [ ] **Step 1: Update RSS with locale-aware paths**

The RSS feed should generate post links with proper locale paths. Update the `getPath` calls to include locale prefix when needed.

```typescript
import { getRelativeLocaleUrl } from "astro:i18n";
import { defaultLocale } from "@/i18n/ui";

// In the items mapping:
items: sortedPosts.map(({ data, id, filePath }) => {
  const postPath = getPath(id, filePath);
  const localePath = getRelativeLocaleUrl(defaultLocale, postPath.replace(/^\//, ""));
  return {
    link: new URL(localePath, siteURL).toString(),
    // ...
  };
}),
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/rss.xml.ts
git commit -m "feat(i18n): update RSS feed with locale-aware paths"
```

---

## Task 12: Verify Build

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
| 1 | ui.ts, utils.ts | Translation strings and t() utility |
| 2 | astro.config.mjs, middleware.js | Astro i18n config and middleware |
| 2.5 | getPath.ts | Review and ensure consistent path format |
| 3 | LanguageSwitcher.astro, IconGlobe.svg | Language toggle |
| 4 | Header.astro | Locale-aware nav links |
| 5 | Footer.astro, Datetime.astro | Translation text |
| 6 | Pagination.astro | Locale-aware pagination |
| 7 | Card.astro, BackButton.astro | Locale-aware post links |
| 8 | PostDetails.astro | Locale-aware prev/next links |
| 9 | index, posts, search, 404, about pages | Page updates |
| 10 | Layout.astro | hreflang SEO |
| 11 | rss.xml.ts | RSS feed updates |
| 12 | - | Verify build |
