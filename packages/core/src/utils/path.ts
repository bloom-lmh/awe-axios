export function isAbsoluteHttpUrl(value?: string): value is string {
  return typeof value === 'string' && /^[a-z][a-z\d+\-.]*:\/\//i.test(value);
}

function trimSegment(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, '');
}

export function joinPathname(...parts: Array<string | undefined>): string {
  const filtered = parts.filter((part): part is string => typeof part === 'string' && part.trim().length > 0);
  if (filtered.length === 0) {
    return '';
  }

  const leadingSlash = filtered.some(part => part.startsWith('/'));
  const segments = filtered.map(trimSegment).filter(Boolean);

  if (segments.length === 0) {
    return leadingSlash ? '/' : '';
  }

  return `${leadingSlash ? '/' : ''}${segments.join('/')}`;
}

export function composeDecoratedUrl(classUrl?: string, methodUrl?: string): string {
  if (isAbsoluteHttpUrl(methodUrl)) {
    return methodUrl;
  }

  if (isAbsoluteHttpUrl(classUrl)) {
    const parsed = new URL(classUrl);
    if (!methodUrl) {
      return classUrl;
    }

    return `${parsed.origin}${joinPathname(parsed.pathname, methodUrl)}`;
  }

  return joinPathname(classUrl, methodUrl);
}

export function resolvePathParams(url: string, params: Record<string, unknown>): string {
  if (!url) {
    return url;
  }

  return url.replace(/:([\w-]+)/g, (placeholder, key: string) => {
    const value = params[key];
    if (value === undefined || value === null) {
      return placeholder;
    }

    return encodeURIComponent(String(value));
  });
}

export function resolveAbsoluteHttpTarget(baseURL: string | undefined, url: string): { origin: string; pathname: string } {
  if (isAbsoluteHttpUrl(url)) {
    const parsed = new URL(url);
    return {
      origin: parsed.origin,
      pathname: joinPathname(parsed.pathname),
    };
  }

  if (!baseURL || !isAbsoluteHttpUrl(baseURL)) {
    throw new Error('Mock support requires an absolute baseURL or an absolute request URL.');
  }

  const parsed = new URL(baseURL);
  return {
    origin: parsed.origin,
    pathname: joinPathname(parsed.pathname, url),
  };
}
