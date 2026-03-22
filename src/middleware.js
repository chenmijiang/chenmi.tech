export const onRequest = async (context, next) => {
  const url = new URL(context.request.url);

  // Legacy /blog redirects - preserve locale
  const blogMatch = url.pathname.match(/^\/(en|zh)?\/blog(\/.*)?$/);
  if (blogMatch) {
    const localePrefix = blogMatch[1] ? `/${blogMatch[1]}` : "";
    const pathSuffix = blogMatch[2] || "";
    const targetPath = pathSuffix ? `${localePrefix}/posts${pathSuffix}` : `${localePrefix}/posts`;
    return context.redirect(targetPath, 301);
  }

  return next();
};
