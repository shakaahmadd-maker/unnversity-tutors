import hero1on1Jpg from '../assets/images/hero_1on1_tutoring_1787387369345.jpg';
import hero1on1Avif480 from '../assets/images/hero_1on1_tutoring_1787387369345_480.avif';
import hero1on1Avif768 from '../assets/images/hero_1on1_tutoring_1787387369345_768.avif';
import hero1on1Avif1024 from '../assets/images/hero_1on1_tutoring_1787387369345_1024.avif';
import hero1on1Webp480 from '../assets/images/hero_1on1_tutoring_1787387369345_480.webp';
import hero1on1Webp768 from '../assets/images/hero_1on1_tutoring_1787387369345_768.webp';
import hero1on1Webp1024 from '../assets/images/hero_1on1_tutoring_1787387369345_1024.webp';

export interface LocalMediaBundle {
  avifSrcSet: string;
  webpSrcSet: string;
  fallbackSrc: string;
  intrinsicWidth: number;
  intrinsicHeight: number;
}

const LOCAL_MEDIA_REGISTRY = new Map<string, LocalMediaBundle>([
  [
    hero1on1Jpg,
    {
      avifSrcSet: `${hero1on1Avif480} 480w, ${hero1on1Avif768} 768w, ${hero1on1Avif1024} 1024w`,
      webpSrcSet: `${hero1on1Webp480} 480w, ${hero1on1Webp768} 768w, ${hero1on1Webp1024} 1024w`,
      fallbackSrc: hero1on1Jpg,
      intrinsicWidth: 1024,
      intrinsicHeight: 572,
    },
  ],
]);

export function registerLocalOptimizedMedia(entries: Array<[string, LocalMediaBundle]>): void {
  for (const [key, bundle] of entries) {
    if (!LOCAL_MEDIA_REGISTRY.has(key)) {
      LOCAL_MEDIA_REGISTRY.set(key, bundle);
    }
  }
}

export function getLocalOptimizedMedia(src?: string | null): LocalMediaBundle | null {
  if (!src) return null;
  return LOCAL_MEDIA_REGISTRY.get(src) || null;
}
