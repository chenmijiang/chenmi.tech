export const ui = {
  en: {
    nav: {
      blog: "Blog",
      about: "About",
      skipToContent: "Skip to content",
      search: "Search",
      goBack: "Go back",
      backToTop: "Back to Top",
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
      months: {
        january: "January",
        february: "February",
        march: "March",
        april: "April",
        may: "May",
        june: "June",
        july: "July",
        august: "August",
        september: "September",
        october: "October",
        november: "November",
        december: "December",
      },
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
    home: {
      featured: "Featured",
      allPosts: "All Posts",
      rssFeed: "RSS Feed",
      goHome: "Go back home",
    },
    posts: {
      browseByDate: "Browse all blog posts by year and month",
    },
  },
  zh: {
    nav: {
      blog: "博客",
      about: "关于",
      skipToContent: "跳转到内容",
      search: "搜索",
      goBack: "返回",
      backToTop: "回到顶部",
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
      months: {
        january: "一月",
        february: "二月",
        march: "三月",
        april: "四月",
        may: "五月",
        june: "六月",
        july: "七月",
        august: "八月",
        september: "九月",
        october: "十月",
        november: "十一月",
        december: "十二月",
      },
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
    home: {
      featured: "精选",
      allPosts: "所有文章",
      rssFeed: "RSS 订阅",
      goHome: "返回首页",
    },
    posts: {
      browseByDate: "按年月浏览所有博客文章",
    },
  },
} as const;

export type Locale = keyof typeof ui;
export const defaultLocale: Locale = "en";
