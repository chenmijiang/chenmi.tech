export const onRequest = async (context, next) => {
  const url = new URL(context.request.url);

  // Redirect root to Chinese if browser prefers zh, else stay on English root
  if (url.pathname === "/" || url.pathname === "") {
    const acceptLanguage = context.request.headers.get("accept-language") || "";
    if (acceptLanguage.toLowerCase().startsWith("zh")) {
      return context.redirect("/zh/", 302);
    }
    // English root - don't redirect
    return next();
  }

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
