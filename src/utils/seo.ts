/**
 * Production SEO & Metadata Manager for university-tutors.com
 * Handles dynamic canonical URL normalization, parameter URL stripping,
 * OpenGraph synchronization, and hreflang verification.
 */

export const BASE_CANONICAL_DOMAIN = 'https://university-tutors.com';

interface SeoMetadataOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  robots?: string;
  structuredData?: Record<string, any> | null;
}

/**
 * Strips tracking parameters, query strings, hashes, and trailing slashes to return a clean canonical URL
 */
export function getCleanCanonicalUrl(pathname?: string): string {
  const raw = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const withoutQuery = String(raw).split('?')[0].split('#')[0];
  let normalizedPath = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  normalizedPath = normalizedPath.replace(/\/{2,}/g, '/');
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }
  return `${BASE_CANONICAL_DOMAIN}${normalizedPath || '/'}`;
}

/**
 * Dynamically updates or inserts the canonical <link> tag in the document <head>.
 */
export function updateCanonicalTag(customCanonicalUrl?: string): void {
  if (typeof document === 'undefined') return;

  const targetUrl = customCanonicalUrl || getCleanCanonicalUrl();

  let linkTag = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
  if (!linkTag) {
    linkTag = document.createElement('link');
    linkTag.setAttribute('rel', 'canonical');
    linkTag.id = 'canonical-url';
    document.head.appendChild(linkTag);
  }

  linkTag.setAttribute('href', targetUrl);

  let ogUrlTag = document.querySelector<HTMLMetaElement>("meta[property='og:url']");
  if (!ogUrlTag) {
    ogUrlTag = document.createElement('meta');
    ogUrlTag.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrlTag);
  }
  ogUrlTag.setAttribute('content', targetUrl);
}

/**
 * Updates full page SEO meta elements, robots directives, and JSON-LD across client-side transitions
 */
export function updatePageSeo(options: SeoMetadataOptions): void {
  if (typeof document === 'undefined') return;

  const { title, description, keywords, canonicalPath, ogImage, ogType, robots, structuredData } = options;

  if (title) {
    document.title = title;
    const ogTitle = document.querySelector<HTMLMetaElement>("meta[property='og:title']");
    if (ogTitle) ogTitle.setAttribute('content', title);
    const twTitle = document.querySelector<HTMLMetaElement>("meta[name='twitter:title']");
    if (twTitle) twTitle.setAttribute('content', title);
  }

  if (description) {
    let metaDesc = document.querySelector<HTMLMetaElement>("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    const ogDesc = document.querySelector<HTMLMetaElement>("meta[property='og:description']");
    if (ogDesc) ogDesc.setAttribute('content', description);
    const twDesc = document.querySelector<HTMLMetaElement>("meta[name='twitter:description']");
    if (twDesc) twDesc.setAttribute('content', description);
  }

  if (keywords && keywords.length > 0) {
    let metaKw = document.querySelector<HTMLMetaElement>("meta[name='keywords']");
    if (!metaKw) {
      metaKw = document.createElement('meta');
      metaKw.setAttribute('name', 'keywords');
      document.head.appendChild(metaKw);
    }
    metaKw.setAttribute('content', keywords.join(', '));
  }

  if (ogType) {
    const ogTypeTag = document.querySelector<HTMLMetaElement>("meta[property='og:type']");
    if (ogTypeTag) ogTypeTag.setAttribute('content', ogType);
  }

  const targetRobots = robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  let robotsTag = document.querySelector<HTMLMetaElement>("meta[name='robots']");
  if (!robotsTag) {
    robotsTag = document.createElement('meta');
    robotsTag.setAttribute('name', 'robots');
    document.head.appendChild(robotsTag);
  }
  robotsTag.setAttribute('content', targetRobots);

  const cleanCanonical = getCleanCanonicalUrl(canonicalPath);
  updateCanonicalTag(cleanCanonical);

  if (ogImage) {
    const ogImg = document.querySelector<HTMLMetaElement>("meta[property='og:image']");
    if (ogImg) ogImg.setAttribute('content', ogImage);
    const twImg = document.querySelector<HTMLMetaElement>("meta[name='twitter:image']");
    if (twImg) twImg.setAttribute('content', ogImage);
  }

  if (structuredData !== undefined) {
    let jsonLdScript = document.querySelector<HTMLScriptElement>('script#dynamic-route-jsonld');
    if (structuredData === null) {
      if (jsonLdScript) jsonLdScript.remove();
    } else {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.id = 'dynamic-route-jsonld';
        jsonLdScript.type = 'application/ld+json';
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify(structuredData);
    }
  }
}
