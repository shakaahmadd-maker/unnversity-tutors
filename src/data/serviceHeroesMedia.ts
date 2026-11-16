import heroAssignJpg from '../assets/images/hero_assignment_guidance_1787387387028.jpg';
import heroAssignAvif480 from '../assets/images/hero_assignment_guidance_1787387387028_480.avif';
import heroAssignAvif768 from '../assets/images/hero_assignment_guidance_1787387387028_768.avif';
import heroAssignAvif1024 from '../assets/images/hero_assignment_guidance_1787387387028_1024.avif';
import heroAssignWebp480 from '../assets/images/hero_assignment_guidance_1787387387028_480.webp';
import heroAssignWebp768 from '../assets/images/hero_assignment_guidance_1787387387028_768.webp';
import heroAssignWebp1024 from '../assets/images/hero_assignment_guidance_1787387387028_1024.webp';

import heroCourseJpg from '../assets/images/hero_coursework_tracks_1787387403661.jpg';
import heroCourseAvif480 from '../assets/images/hero_coursework_tracks_1787387403661_480.avif';
import heroCourseAvif768 from '../assets/images/hero_coursework_tracks_1787387403661_768.avif';
import heroCourseAvif1024 from '../assets/images/hero_coursework_tracks_1787387403661_1024.avif';
import heroCourseWebp480 from '../assets/images/hero_coursework_tracks_1787387403661_480.webp';
import heroCourseWebp768 from '../assets/images/hero_coursework_tracks_1787387403661_768.webp';
import heroCourseWebp1024 from '../assets/images/hero_coursework_tracks_1787387403661_1024.webp';

import heroEssayJpg from '../assets/images/hero_essay_rhetoric_1787387419893.jpg';
import heroEssayAvif480 from '../assets/images/hero_essay_rhetoric_1787387419893_480.avif';
import heroEssayAvif768 from '../assets/images/hero_essay_rhetoric_1787387419893_768.avif';
import heroEssayAvif1024 from '../assets/images/hero_essay_rhetoric_1787387419893_1024.avif';
import heroEssayWebp480 from '../assets/images/hero_essay_rhetoric_1787387419893_480.webp';
import heroEssayWebp768 from '../assets/images/hero_essay_rhetoric_1787387419893_768.webp';
import heroEssayWebp1024 from '../assets/images/hero_essay_rhetoric_1787387419893_1024.webp';

import { registerLocalOptimizedMedia } from './optimizedMedia';

registerLocalOptimizedMedia([
  [
    heroAssignJpg,
    {
      avifSrcSet: `${heroAssignAvif480} 480w, ${heroAssignAvif768} 768w, ${heroAssignAvif1024} 1024w`,
      webpSrcSet: `${heroAssignWebp480} 480w, ${heroAssignWebp768} 768w, ${heroAssignWebp1024} 1024w`,
      fallbackSrc: heroAssignJpg,
      intrinsicWidth: 1024,
      intrinsicHeight: 572,
    },
  ],
  [
    heroCourseJpg,
    {
      avifSrcSet: `${heroCourseAvif480} 480w, ${heroCourseAvif768} 768w, ${heroCourseAvif1024} 1024w`,
      webpSrcSet: `${heroCourseWebp480} 480w, ${heroCourseWebp768} 768w, ${heroCourseWebp1024} 1024w`,
      fallbackSrc: heroCourseJpg,
      intrinsicWidth: 1024,
      intrinsicHeight: 572,
    },
  ],
  [
    heroEssayJpg,
    {
      avifSrcSet: `${heroEssayAvif480} 480w, ${heroEssayAvif768} 768w, ${heroEssayAvif1024} 1024w`,
      webpSrcSet: `${heroEssayWebp480} 480w, ${heroEssayWebp768} 768w, ${heroEssayWebp1024} 1024w`,
      fallbackSrc: heroEssayJpg,
      intrinsicWidth: 1024,
      intrinsicHeight: 572,
    },
  ],
]);
