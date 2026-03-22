export const ui = {
  en: {
    nav: {
      blog: "Blog",
      about: "About",
      skipToContent: "Skip to content",
      search: "Search",
      goBack: "Go back",
      backToTop: "Back to Top",
      openMenu: "Open Menu",
      closeMenu: "Close Menu",
      toggleTheme: "Toggles light & dark",
      archives: "Archives",
    },
    pagination: {
      prev: "Prev",
      next: "Next",
      latestPosts: "Latest Posts",
      readMore: "Read more",
      previous: "Previous",
      page: "Page",
      pageSuffix: "",
    },
    footer: {
      viewSource: "Deployed with Alibaba Cloud",
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
      title: "Search",
      placeholder: "Search posts...",
      description: "Search posts and notes published on",
      inputPlaceholder: "Search posts, e.g. 'React' or 'AI'",
      devWarning:
        "DEV mode Warning! You need to build the project at least once to see the search results during development.",
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
      greeting: "Hi, I'm chenmi.",
      bio: "A full-stack developer who enjoys exploring the intersection between elegant front-ends and robust back-ends, and is passionate about using modern technologies to build scalable web applications.",
    },
    posts: {
      title: "Posts",
      description: "Archive of all posts published on",
      browseByDate: "Browse all blog posts by year and month",
      previousPost: "Previous Post",
      nextPost: "Next Post",
    },
    tags: {
      title: "Tags",
      description: "All the tags used in posts.",
      tagPrefix: "Tag:",
      tagDesc: "All the articles with the tag",
    },
    share: {
      shareOn: "Share this post on:",
    },
    newsletter: {
      followAlong: "Follow along for new posts, project notes, and updates from",
      noNewsletter:
        "No newsletter setup yet. RSS and social links are the current best way to keep up.",
    },
    code: {
      copy: "Copy",
      copied: "Copied",
    },
    archives: {
      title: "Archives",
      description: "Browse all posts by year and month",
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
      openMenu: "打开菜单",
      closeMenu: "关闭菜单",
      toggleTheme: "切换亮色/暗色模式",
      archives: "归档",
    },
    pagination: {
      prev: "上一页",
      next: "下一页",
      latestPosts: "最新文章",
      readMore: "阅读更多",
      previous: "上一页",
      page: "第",
      pageSuffix: "页",
    },
    footer: {
      viewSource: "部署在阿里云上",
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
      title: "搜索",
      placeholder: "搜索文章...",
      description: "搜索发布在",
      inputPlaceholder: "搜索文章，例如 'React' 或 'AI'",
      devWarning: "开发模式提示！您需要至少构建一次项目才能在开发过程中看到搜索结果。",
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
      greeting: "你好，我是晨米。",
      bio: "一名全栈开发者，喜欢探索前端优雅和后端健壮之间的交集，热爱使用现代技术打造可扩展 Web 应用程序。",
    },
    posts: {
      title: "文章",
      description: "所有发布的文章归档于",
      browseByDate: "按年月浏览所有博客文章",
      previousPost: "上一篇",
      nextPost: "下一篇",
    },
    tags: {
      title: "标签",
      description: "文章中使用的所有标签。",
      tagPrefix: "标签：",
      tagDesc: "所有包含该标签的文章",
    },
    share: {
      shareOn: "分享这篇文章到：",
    },
    newsletter: {
      followAlong: "关注以获取最新文章、项目笔记和来自",
      noNewsletter: "暂无邮件订阅。RSS 和社交链接是目前最好的关注方式。",
    },
    code: {
      copy: "复制",
      copied: "已复制",
    },
    archives: {
      title: "归档",
      description: "按年月浏览所有文章",
    },
  },
} as const;

export type Locale = keyof typeof ui;
export const defaultLocale: Locale = "en";
