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
