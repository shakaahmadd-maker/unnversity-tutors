export interface ResponsiveImageSources {
  src: string;
  srcSet?: string;
  sizes?: string;
  avifSrcSet?: string;
  webpSrcSet?: string;
  fallbackSrc: string;
  isOptimizedUpload?: boolean;
}

/**
 * Checks whether a URL points to an Unsplash image CDN.
 */
export function isUnsplashUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('images.unsplash.com/');
}

/**
 * Checks whether a URL points to our persistent /uploads/avatars/ endpoint
 * (excluding already-optimized -opt- derivatives).
 */
export function isUploadAvatarUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:') || url.startsWith('blob:')) return false;
  return /\/uploads\/avatars\/[^/?#]+\.(jpe?g|png|webp)(\?|$)/i.test(url) && !/-opt-\d+\.(webp|avif)(\?|$)/i.test(url);
}

/**
 * Rewrites an Unsplash URL cleanly with target width, quality, and format
 * while preserving the exact image ID and crop behavior.
 */
export function buildUnsplashUrl(
  rawUrl: string,
  width: number,
  options?: { height?: number; quality?: number; format?: 'avif' | 'webp' | 'auto'; squareCrop?: boolean }
): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('w', String(width));
    if (options?.squareCrop) {
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('h', String(options.height || width));
    } else if (options?.height) {
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('h', String(options.height));
    }
    if (options?.format && options.format !== 'auto') {
      parsed.searchParams.set('fm', options.format);
    }
    parsed.searchParams.set('q', String(options?.quality ?? (width <= 128 ? 72 : 76)));
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

/**
 * Given a local /uploads/avatars/<name>.<ext> URL (with optional origin & query),
 * returns its deterministic WebP and AVIF derivative URLs alongside the untouched original.
 */
export function getUploadAvatarDerivatives(url: string): {
  smWebp: string;
  smAvif: string;
  mdWebp: string;
  mdAvif: string;
  original: string;
} {
  const [cleanBase, rawQuery] = url.split('?');
  const qs = rawQuery ? `?${rawQuery}` : '';
  const match = cleanBase.match(/^(.*\/uploads\/avatars\/)([^/]+)\.(jpe?g|png|webp)$/i);
  if (!match) {
    return { smWebp: url, smAvif: url, mdWebp: url, mdAvif: url, original: url };
  }
  const [, prefix, stem] = match;
  return {
    smWebp: `${prefix}${stem}-opt-96.webp${qs}`,
    smAvif: `${prefix}${stem}-opt-96.avif${qs}`,
    mdWebp: `${prefix}${stem}-opt-256.webp${qs}`,
    mdAvif: `${prefix}${stem}-opt-256.avif${qs}`,
    original: url,
  };
}

/**
 * Resolves optimized responsive attributes for avatar/thumbnail URLs
 * (supports Unsplash, /uploads/avatars/*, and standard URLs).
 */
export function getResponsiveAvatarProps(
  rawUrl: string | undefined | null,
  fallbackUrl: string,
  displaySizePx: number = 48
): ResponsiveImageSources {
  const src = (rawUrl && rawUrl.trim()) || fallbackUrl;
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
    return { src: src || fallbackUrl, fallbackSrc: fallbackUrl };
  }

  if (isUploadAvatarUrl(src)) {
    const derivs = getUploadAvatarDerivatives(src);
    const useSmall = displaySizePx <= 64;
    return {
      src: useSmall ? derivs.smWebp : derivs.mdWebp,
      avifSrcSet: `${derivs.smAvif} 96w, ${derivs.mdAvif} 256w`,
      webpSrcSet: `${derivs.smWebp} 96w, ${derivs.mdWebp} 256w`,
      sizes: `${Math.max(32, Math.min(256, displaySizePx))}px`,
      fallbackSrc: derivs.original,
      isOptimizedUpload: true,
    };
  }

  if (isUnsplashUrl(src)) {
    const targetW = displaySizePx <= 32 ? 64 : displaySizePx <= 64 ? 96 : displaySizePx <= 128 ? 192 : 256;
    const widths = displaySizePx <= 64 ? [64, 96, 192] : [96, 192, 256];
    const sizes = `${displaySizePx}px`;
    return {
      src: buildUnsplashUrl(src, targetW, { squareCrop: true, quality: 75 }),
      avifSrcSet: widths
        .map((w) => `${buildUnsplashUrl(src, w, { squareCrop: true, quality: 58, format: 'avif' })} ${w}w`)
        .join(', '),
      webpSrcSet: widths
        .map((w) => `${buildUnsplashUrl(src, w, { squareCrop: true, quality: 74, format: 'webp' })} ${w}w`)
        .join(', '),
      srcSet: widths
        .map((w) => `${buildUnsplashUrl(src, w, { squareCrop: true, quality: 75 })} ${w}w`)
        .join(', '),
      sizes,
      fallbackSrc: buildUnsplashUrl(src, targetW, { squareCrop: true, quality: 75 }),
    };
  }

  return { src, fallbackSrc: fallbackUrl };
}

/**
 * Resolves optimized responsive attributes for larger card/banner Unsplash images
 * without changing aspect ratio or cropping.
 */
export function getResponsiveBannerProps(
  rawUrl: string,
  widths: number[] = [360, 560, 800],
  sizes: string = '(max-width: 768px) 92vw, 420px',
  defaultWidth: number = 560
): ResponsiveImageSources {
  if (!isUnsplashUrl(rawUrl)) {
    return { src: rawUrl, sizes, fallbackSrc: rawUrl };
  }
  return {
    src: buildUnsplashUrl(rawUrl, defaultWidth, { quality: 76 }),
    avifSrcSet: widths
      .map((w) => `${buildUnsplashUrl(rawUrl, w, { quality: 55, format: 'avif' })} ${w}w`)
      .join(', '),
    webpSrcSet: widths
      .map((w) => `${buildUnsplashUrl(rawUrl, w, { quality: 75, format: 'webp' })} ${w}w`)
      .join(', '),
    srcSet: widths
      .map((w) => `${buildUnsplashUrl(rawUrl, w, { quality: 76 })} ${w}w`)
      .join(', '),
    sizes,
    fallbackSrc: buildUnsplashUrl(rawUrl, defaultWidth, { quality: 76 }),
  };
}
