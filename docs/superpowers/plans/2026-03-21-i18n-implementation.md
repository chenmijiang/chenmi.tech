# i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add English/Chinese i18n support with browser auto-detection and manual toggle, without changing URL structure.

**Architecture:** Cookie-based language preference with middleware detection. All UI text stored in translation files, passed via Astro.locals.

**Tech Stack:** Astro middleware, Astro.locals, vanilla JS cookie handling, CSS-based button styling (ThemeToggle pattern).

---

## File Structure

```
src/
├── i18n/
│   ├── ui.ts          # Translation strings (en, zh)
│   └── utils.ts       # getLocale(), t() helpers
├── middleware.js      # Language detection + cookie
├── env.d.ts          # Astro.locals type declaration
└── components/
    └── LanguageSwitcher.astro  # Language toggle button
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

## Task 2: Update Middleware and Types

**Files:**
- Modify: `src/middleware.js`
- Modify: `src/env.d.ts`

- [ ] **Step 1: Update `src/env.d.ts` to add Astro.locals type**

```typescript
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    lang: "en" | "zh";
  }
}
```

- [ ] **Step 2: Update `src/middleware.js`**

```javascript
import { ui, defaultLocale } from "./i18n/ui";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function parseAcceptLanguage(header) {
  if (!header) return defaultLocale;
  const langs = header.split(",").map((l) => l.split(";")[0].trim().toLowerCase());
  for (const lang of langs) {
    if (lang.startsWith("zh")) return "zh";
  }
  return defaultLocale;
}

export const onRequest = async (context, next) => {
  const url = new URL(context.request.url);

  // Existing redirects
  if (url.pathname.startsWith("/blog/")) {
    return context.redirect("/posts/" + url.pathname.slice(6), 301);
  }
  if (url.pathname === "/blog" || url.pathname === "/blog/") {
    return context.redirect("/posts", 301);
  }

  // i18n: Determine language
  let lang = defaultLocale;
  const cookies = context.cookies;
  const storedLang = cookies.get("lang")?.value;

  if (storedLang && storedLang in ui) {
    lang = storedLang;
  } else {
    const acceptLanguage = context.request.headers.get("accept-language");
    lang = parseAcceptLanguage(acceptLanguage);
  }

  // Set cookie if not already set
  if (!storedLang) {
    cookies.set("lang", lang, {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
    });
  }

  // Pass lang to Astro.locals
  context.locals.lang = lang;

  return next();
};
```

- [ ] **Step 3: Commit**

```bash
git add src/env.d.ts src/middleware.js
git commit -m "feat(i18n): add language detection middleware"
```

---

## Task 3: Create LanguageSwitcher Component

**Files:**
- Create: `src/components/LanguageSwitcher.astro`
- Create: `src/assets/icons/IconGlobe.svg`

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
import { ui, defaultLocale } from "@/i18n/ui";

const { lang } = Astro.locals;
const currentLang = lang || defaultLocale;
---

<button
  id="lang-toggle"
  type="button"
  class="rounded-md p-2 text-gray-600 dark:text-gray-300 transition-colors hover:bg-secondary hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none"
  aria-label="Toggle language"
  title={currentLang === "en" ? "Switch to Chinese" : "切换到英文"}
>
  <IconGlobe class="h-5 w-5" />
  <span class="sr-only">{currentLang === "en" ? "中文" : "English"}</span>
</button>

<script>
  function toggleLang() {
    const currentLang = document.documentElement.lang || "en";
    const newLang = currentLang === "en" ? "zh" : "en";
    
    document.cookie = `lang=${newLang}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    
    window.location.reload();
  }

  const button = document.getElementById("lang-toggle");
  button?.addEventListener("click", toggleLang);
</script>
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

- [ ] **Step 1: Add LanguageSwitcher next to ThemeToggle in Header**

Find the ThemeToggle `<li>` element and add LanguageSwitcher after it:

```astro
{
  SITE.lightAndDarkMode && (
    <li class="col-span-1 flex items-center justify-center">
      <button
        id="theme-btn"
        class="focus-outline relative size-12 p-4 sm:size-8 hover:[&>svg]:stroke-accent"
        title="Toggles light & dark"
        aria-label="auto"
        aria-live="polite"
      >
        <IconMoon class="absolute top-[50%] left-[50%] -translate-[50%] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <IconSunHigh class="absolute top-[50%] left-[50%] -translate-[50%] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </button>
    </li>
  )
}
<li class="col-span-1 flex items-center justify-center">
  <LanguageSwitcher />
</li>
```

Add import:
```astro
import LanguageSwitcher from "./LanguageSwitcher.astro";
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat(i18n): integrate LanguageSwitcher in Header"
```

---

## Task 5: Update Layout to Set lang Attribute

**Files:**
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Update html lang attribute**

In Layout.astro, change:
```astro
<html lang={`${SITE.lang ?? "en"}`} class={`${scrollSmooth && "scroll-smooth"}`}>
```

To:
```astro
const { lang = "en" } = Astro.locals;
---
<html lang={lang} class={`${scrollSmooth && "scroll-smooth"}`}>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat(i18n): set html lang from Astro.locals"
```

---

## Task 6: Update Components to Use Translations

**Files:**
- Modify: `src/components/Datetime.astro`
- Modify: `src/components/Pagination.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/pages/404.astro`
- Modify: `src/components/Header.astro` (Skip to content text)

- [ ] **Step 1: Update `src/components/Datetime.astro`**

Add import:
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";
```

Replace "Updated:" and "Published:" text:
```astro
const lang = Astro.locals.lang || defaultLocale;
const publishedLabel = t(lang, "datetime.published");
const updatedLabel = t(lang, "datetime.updated");
```

Replace in template:
```astro
<span class="sr-only">{publishedLabel}</span>
```
```astro
<span class="text-sm italic">
  {updatedLabel}
</span>
```

- [ ] **Step 2: Update `src/components/Pagination.astro`**

Add import and use t():
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";

const lang = Astro.locals.lang || defaultLocale;
```

Replace "Prev" and "Next" with `{t(lang, "pagination.prev")}` and `{t(lang, "pagination.next")}`.

- [ ] **Step 3: Update `src/components/Footer.astro`**

Add import and use t():
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";

const lang = Astro.locals.lang || defaultLocale;
```

Replace "View source on GitHub" with `{t(lang, "footer.viewSource")}`.

- [ ] **Step 4: Update `src/pages/404.astro`**

Add import and use t():
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";

const lang = Astro.locals.lang || defaultLocale;
```

Replace title and description with translated versions.

- [ ] **Step 5: Update `src/components/Header.astro`**

Add import and use t():
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";

const lang = Astro.locals.lang || defaultLocale;
```

Replace navigation text:
- "Posts" → `{t(lang, "nav.blog")}`
- "About" → `{t(lang, "nav.about")}`
- "Skip to content" → `{t(lang, "nav.skipToContent")}`
- Search `<span class="sr-only">Search</span>` → `<span class="sr-only">{t(lang, "nav.search")}</span>`

- [ ] **Step 6: Commit**

```bash
git add src/components/Datetime.astro src/components/Pagination.astro src/components/Footer.astro src/pages/404.astro src/components/Header.astro
git commit -m "feat(i18n): update components to use translations"
```

---

## Task 7: Update Search Page

**Files:**
- Modify: `src/pages/search.astro`

- [ ] **Step 1: Update search page text**

Add import and use t():
```astro
import { t } from "@/i18n/utils";
import { defaultLocale } from "@/i18n/ui";

const lang = Astro.locals.lang || defaultLocale;
```

Replace hardcoded search placeholder with `{t(lang, "search.placeholder")}`.

- [ ] **Step 2: Commit**

```bash
git add src/pages/search.astro
git commit -m "feat(i18n): update search page text"
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
| 2 | middleware.js, env.d.ts | Language detection and cookie |
| 3 | LanguageSwitcher.astro, IconGlobe.svg | Toggle button |
| 4 | Header.astro | Integrate toggle in nav |
| 5 | Layout.astro | Set html lang attribute |
| 6 | Datetime, Pagination, Footer, 404, Header | Use t() for UI text |
| 7 | search.astro | Update search placeholder |
| 8 | - | Verify build |
