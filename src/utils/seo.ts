/**
 * Production SEO & Metadata Manager for university-tutors.com
 * Handles dynamic canonical URL normalization, parameter URL stripping,
 * OpenGraph synchronization, and hreflang verification.
 */

export const BASE_CANONICAL_DOMAIN = 'https://university-tutors.com';

interface SeoMetadataOptions {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
}

/**
 * Strips tracking parameters, query strings, and hashes to return a clean canonical URL
 */
export function getCleanCanonicalUrl(pathname?: string): string {
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
  // Normalize path: ensure leading slash, remove trailing slash (except root)
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }
  return `${BASE_CANONICAL_DOMAIN}${normalizedPath}`;
}

/**
 * Dynamically updates or inserts the canonical <link> tag in the document <head>.
 * Guarantees parameter-based URLs (e.g. ?utm_source=... or ?ref=...) canonicalize
 * back to the clean primary URL.
 */
export function updateCanonicalTag(customCanonicalUrl?: string): void {
  if (typeof document === 'undefined') return;

  const targetUrl = customCanonicalUrl || getCleanCanonicalUrl();

  let linkTag = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
  if (!linkTag) {
    linkTag = document.createElement('link');
    linkTag.setAttribute('rel', 'canonical');
    document.head.appendChild(linkTag);
  }

  linkTag.setAttribute('href', targetUrl);

  // Synchronize OpenGraph URL with the canonical URL
  let ogUrlTag = document.querySelector<HTMLMetaElement>("meta[property='og:url']");
  if (!ogUrlTag) {
    ogUrlTag = document.createElement('meta');
    ogUrlTag.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrlTag);
  }
  ogUrlTag.setAttribute('content', targetUrl);
}

/**
 * Updates full page SEO meta elements across client-side page transitions
 */
export function updatePageSeo(options: SeoMetadataOptions): void {
  if (typeof document === 'undefined') return;

  const { title, description, canonicalPath, ogImage } = options;

  if (title) {
    document.title = title;
    const ogTitle = document.querySelector<HTMLMetaElement>("meta[property='og:title']");
    if (ogTitle) ogTitle.setAttribute('content', title);
    const twTitle = document.querySelector<HTMLMetaElement>("meta[name='twitter:title']");
    if (twTitle) twTitle.setAttribute('content', title);
  }

  if (description) {
    const metaDesc = document.querySelector<HTMLMetaElement>("meta[name='description']");
    if (metaDesc) metaDesc.setAttribute('content', description);
    const ogDesc = document.querySelector<HTMLMetaElement>("meta[property='og:description']");
    if (ogDesc) ogDesc.setAttribute('content', description);
    const twDesc = document.querySelector<HTMLMetaElement>("meta[name='twitter:description']");
    if (twDesc) twDesc.setAttribute('content', description);
  }

  const cleanCanonical = getCleanCanonicalUrl(canonicalPath);
  updateCanonicalTag(cleanCanonical);

  if (ogImage) {
    const ogImg = document.querySelector<HTMLMetaElement>("meta[property='og:image']");
    if (ogImg) ogImg.setAttribute('content', ogImage);
    const twImg = document.querySelector<HTMLMetaElement>("meta[name='twitter:image']");
    if (twImg) twImg.setAttribute('content', ogImage);
  }
}
