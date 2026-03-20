import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const markdownContent = `# chenmi

Full-stack developer building scalable web applications with React, TypeScript, Node.js, and a growing focus on Rust, Docker, and AI.

## Navigation

- [About](/about.md)
- [Recent Posts](/posts.md)
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
