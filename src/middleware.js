import { legacyBlogPath } from "@/i18n/routing";

export const onRequest = async (context, next) => {
  const targetPath = legacyBlogPath(new URL(context.request.url).pathname);
  return targetPath ? context.redirect(targetPath, 301) : next();
};
