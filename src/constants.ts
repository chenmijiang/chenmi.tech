import { SITE } from "./consts";

export const SOCIALS = [
  {
    name: "Github",
    href: "https://github.com/chenmijiang",
    linkTitle: ` ${SITE.title} on Github`,
    icon: "github",
    active: true,
  },
  {
    name: "X",
    href: "https://x.com/chenmijiang",
    linkTitle: `${SITE.title} on X`,
    icon: "twitter",
    active: true,
  },
  {
    name: "Yuque",
    href: "https://www.yuque.com/chenmijiang",
    linkTitle: `${SITE.title} on Yuque`,
    icon: "yuque",
    active: true,
  },
  {
    name: "BiliBili",
    href: "https://space.bilibili.com/442642038",
    linkTitle: `${SITE.title} on BiliBili`,
    icon: "bilibili",
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:jack.chenyuana@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: "mail",
    active: true,
  },
] as const;

export const SHARE_LINKS = [
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `Share this post on X`,
    icon: "twitter",
  },
  {
    name: "QQ",
    href: "https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=",
    linkTitle: `Share this post on QQ`,
    icon: "qq",
  },
] as const;
