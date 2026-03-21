import { getRelativeLocaleUrl } from "astro:i18n";
import type { APIRoute } from "astro";
import { defaultLocale, type Locale } from "@/i18n/ui";

export const GET: APIRoute = async ({ currentLocale }) => {
  const locale = (currentLocale || defaultLocale) as Locale;

  const markdownContent = `# chenmi

Full-stack developer building scalable web applications with React, TypeScript, Node.js, and a growing focus on Rust, Docker, and AI.

## Navigation

- [About](${getRelativeLocaleUrl(locale, "about")}.md)
- [Recent Posts](${getRelativeLocaleUrl(locale, "posts")}.md)
- [RSS Feed](/rss.xml)

## Links

- X: [@chenmijiang](https://x.com/chenmijiang)
- GitHub: [@chenmijiang](https://github.com/chenmijiang)
- Email: jack.chenyuana@gmail.com

---

*This is the markdown-friendly version of chenmi.tech. Visit [chenmi.tech](https://chenmi.tech) for the full experience.*`;

  return new Response(markdownContent, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
