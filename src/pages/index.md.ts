import type { APIRoute } from "astro";
import { getLocale, localePath } from "@/i18n/routing";

export const GET: APIRoute = async ({ currentLocale }) => {
  const locale = getLocale(currentLocale);

  const markdownContent = `# chenmi

Full-stack developer building scalable web applications with React, TypeScript, Node.js, and a growing focus on Rust, Docker, and AI.

## Navigation

- [About](${localePath(locale, "about")})
- [Recent Posts](${localePath(locale, "posts")})
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
