import React from 'react';
import { getLocalOptimizedMedia } from '../data/optimizedMedia';
import { getResponsiveAvatarProps, getResponsiveBannerProps } from '../utils/imageOptimization';

interface ResponsiveAvatarProps {
  key?: string | number | null;
  src?: string | null;
  alt: string;
  sizePx?: number;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

const DEFAULT_FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&auto=format&q=75';

/**
 * Renders a crisp, lightweight avatar (<picture> with AVIF/WebP srcset and fallback)
 * targeting exact small display dimensions while preserving visual appearance.
 */
export function ResponsiveAvatar({
  src,
  alt,
  sizePx = 48,
  width,
  height,
  className = '',
  fallbackSrc = DEFAULT_FALLBACK_AVATAR,
  loading = 'lazy',
  referrerPolicy = 'no-referrer',
}: ResponsiveAvatarProps) {
  const w = width ?? sizePx;
  const h = height ?? sizePx;
  const localBundle = getLocalOptimizedMedia(src);

  if (localBundle) {
    return (
      <picture>
        <source type="image/avif" srcSet={localBundle.avifSrcSet} sizes={`${sizePx}px`} />
        <source type="image/webp" srcSet={localBundle.webpSrcSet} sizes={`${sizePx}px`} />
        <img
          src={localBundle.fallbackSrc}
          alt={alt}
          width={w}
          height={h}
          loading={loading}
          decoding="async"
          className={className}
        />
      </picture>
    );
  }

  const resolved = getResponsiveAvatarProps(src, fallbackSrc, sizePx);

  if (resolved.avifSrcSet || resolved.webpSrcSet) {
    return (
      <picture>
        {resolved.avifSrcSet && (
          <source type="image/avif" srcSet={resolved.avifSrcSet} sizes={resolved.sizes || `${sizePx}px`} />
        )}
        {resolved.webpSrcSet && (
          <source type="image/webp" srcSet={resolved.webpSrcSet} sizes={resolved.sizes || `${sizePx}px`} />
        )}
        <img
          src={resolved.src}
          srcSet={resolved.srcSet}
          sizes={resolved.sizes || `${sizePx}px`}
          alt={alt}
          width={w}
          height={h}
          loading={loading}
          decoding="async"
          referrerPolicy={referrerPolicy}
          className={className}
          onError={(e) => {
            if (resolved.fallbackSrc && e.currentTarget.src !== resolved.fallbackSrc) {
              e.currentTarget.srcSet = '';
              e.currentTarget.src = resolved.fallbackSrc;
            }
          }}
        />
      </picture>
    );
  }

  return (
    <img
      src={resolved.src}
      alt={alt}
      width={w}
      height={h}
      loading={loading}
      decoding="async"
      referrerPolicy={referrerPolicy}
      className={className}
      onError={(e) => {
        if (resolved.fallbackSrc && e.currentTarget.src !== resolved.fallbackSrc) {
          e.currentTarget.src = resolved.fallbackSrc;
        }
      }}
    />
  );
}

interface ResponsivePictureProps {
  key?: string | number | null;
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  widths?: number[];
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  fallbackSrc?: string;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
}

/**
 * Renders responsive AVIF/WebP/JPEG <picture> for hero banners & content cards
 * while keeping exact visual crop, dimensions, and aspect ratio.
 */
export function ResponsivePicture({
  src,
  alt,
  width,
  height,
  sizes = '(max-width: 768px) 92vw, 480px',
  widths = [360, 560, 800],
  className = '',
  loading = 'lazy',
  fetchPriority,
  referrerPolicy = 'no-referrer',
  fallbackSrc,
  onLoad,
}: ResponsivePictureProps) {
  const localBundle = getLocalOptimizedMedia(src);

  if (localBundle) {
    return (
      <picture>
        <source type="image/avif" srcSet={localBundle.avifSrcSet} sizes={sizes} />
        <source type="image/webp" srcSet={localBundle.webpSrcSet} sizes={sizes} />
        <img
          src={localBundle.fallbackSrc}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          {...(fetchPriority ? { fetchPriority } : {})}
          className={className}
          onLoad={onLoad}
        />
      </picture>
    );
  }

  const banner = getResponsiveBannerProps(src, widths, sizes, widths[1] || widths[0] || 560);

  return (
    <picture>
      {banner.avifSrcSet && <source type="image/avif" srcSet={banner.avifSrcSet} sizes={sizes} />}
      {banner.webpSrcSet && <source type="image/webp" srcSet={banner.webpSrcSet} sizes={sizes} />}
      <img
        src={banner.src}
        srcSet={banner.srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        {...(fetchPriority ? { fetchPriority } : {})}
        referrerPolicy={referrerPolicy}
        className={className}
        onLoad={onLoad}
        onError={(e) => {
          const target = fallbackSrc || banner.fallbackSrc;
          if (target && e.currentTarget.src !== target) {
            e.currentTarget.srcSet = '';
            e.currentTarget.src = target;
          }
        }}
      />
    </picture>
  );
}
