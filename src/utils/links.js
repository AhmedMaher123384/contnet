// Small utility to determine if a URL is external relative to current origin
// and return appropriate props for opening in a new tab safely.
export function getExternalLinkProps(href) {
  if (!href) return {};

  // Treat only http(s) with different origin as external.
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const url = new URL(href, base);
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
    const isExternal = isHttp && url.origin !== base;
    return isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  } catch (e) {
    // Fallback: if it looks like http(s) absolute URL, open in new tab.
    const lower = String(href).toLowerCase();
    const isHttpish = lower.startsWith('http://') || lower.startsWith('https://');
    return isHttpish ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  }
}