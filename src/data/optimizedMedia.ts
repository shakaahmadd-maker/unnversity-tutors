import hero1on1Jpg from '../assets/images/hero_1on1_tutoring_1787387369345.jpg';
import hero1on1Avif480 from '../assets/images/hero_1on1_tutoring_1787387369345_480.avif';
import hero1on1Avif768 from '../assets/images/hero_1on1_tutoring_1787387369345_768.avif';
import hero1on1Avif1024 from '../assets/images/hero_1on1_tutoring_1787387369345_1024.avif';
import hero1on1Webp480 from '../assets/images/hero_1on1_tutoring_1787387369345_480.webp';
import hero1on1Webp768 from '../assets/images/hero_1on1_tutoring_1787387369345_768.webp';
import hero1on1Webp1024 from '../assets/images/hero_1on1_tutoring_1787387369345_1024.webp';

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

import tutorWritingJpg from '../assets/images/tutor_academic_writing_1794552322265.jpg';
import tutorWritingAvif96 from '../assets/images/tutor_academic_writing_1794552322265_96.avif';
import tutorWritingAvif192 from '../assets/images/tutor_academic_writing_1794552322265_192.avif';
import tutorWritingWebp96 from '../assets/images/tutor_academic_writing_1794552322265_96.webp';
import tutorWritingWebp192 from '../assets/images/tutor_academic_writing_1794552322265_192.webp';

import tutorAdmissionsJpg from '../assets/images/tutor_admissions_career_1794552324260.jpg';
import tutorAdmissionsAvif96 from '../assets/images/tutor_admissions_career_1794552324260_96.avif';
import tutorAdmissionsAvif192 from '../assets/images/tutor_admissions_career_1794552324260_192.avif';
import tutorAdmissionsWebp96 from '../assets/images/tutor_admissions_career_1794552324260_96.webp';
import tutorAdmissionsWebp192 from '../assets/images/tutor_admissions_career_1794552324260_192.webp';

import tutorBioJpg from '../assets/images/tutor_biology_biotech_1794553725612.jpg';
import tutorBioAvif96 from '../assets/images/tutor_biology_biotech_1794553725612_96.avif';
import tutorBioAvif192 from '../assets/images/tutor_biology_biotech_1794553725612_192.avif';
import tutorBioWebp96 from '../assets/images/tutor_biology_biotech_1794553725612_96.webp';
import tutorBioWebp192 from '../assets/images/tutor_biology_biotech_1794553725612_192.webp';

import tutorChemJpg from '../assets/images/tutor_chemistry_organic_1794553725890.jpg';
import tutorChemAvif96 from '../assets/images/tutor_chemistry_organic_1794553725890_96.avif';
import tutorChemAvif192 from '../assets/images/tutor_chemistry_organic_1794553725890_192.avif';
import tutorChemWebp96 from '../assets/images/tutor_chemistry_organic_1794553725890_96.webp';
import tutorChemWebp192 from '../assets/images/tutor_chemistry_organic_1794553725890_192.webp';

import tutorLangJpg from '../assets/images/tutor_languages_german_1794552324409.jpg';
import tutorLangAvif96 from '../assets/images/tutor_languages_german_1794552324409_96.avif';
import tutorLangAvif192 from '../assets/images/tutor_languages_german_1794552324409_192.avif';
import tutorLangWebp96 from '../assets/images/tutor_languages_german_1794552324409_96.webp';
import tutorLangWebp192 from '../assets/images/tutor_languages_german_1794552324409_192.webp';

import tutorStemJpg from '../assets/images/tutor_stem_statistics_1794552322797.jpg';
import tutorStemAvif96 from '../assets/images/tutor_stem_statistics_1794552322797_96.avif';
import tutorStemAvif192 from '../assets/images/tutor_stem_statistics_1794552322797_192.avif';
import tutorStemWebp96 from '../assets/images/tutor_stem_statistics_1794552322797_96.webp';
import tutorStemWebp192 from '../assets/images/tutor_stem_statistics_1794552322797_192.webp';

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
  [
    tutorWritingJpg,
    {
      avifSrcSet: `${tutorWritingAvif96} 96w, ${tutorWritingAvif192} 192w`,
      webpSrcSet: `${tutorWritingWebp96} 96w, ${tutorWritingWebp192} 192w`,
      fallbackSrc: tutorWritingJpg,
      intrinsicWidth: 256,
      intrinsicHeight: 256,
    },
  ],
  [
    tutorAdmissionsJpg,
    {
      avifSrcSet: `${tutorAdmissionsAvif96} 96w, ${tutorAdmissionsAvif192} 192w`,
      webpSrcSet: `${tutorAdmissionsWebp96} 96w, ${tutorAdmissionsWebp192} 192w`,
      fallbackSrc: tutorAdmissionsJpg,
      intrinsicWidth: 256,
      intrinsicHeight: 256,
    },
  ],
  [
    tutorBioJpg,
    {
      avifSrcSet: `${tutorBioAvif96} 96w, ${tutorBioAvif192} 192w`,
      webpSrcSet: `${tutorBioWebp96} 96w, ${tutorBioWebp192} 192w`,
      fallbackSrc: tutorBioJpg,
      intrinsicWidth: 256,
      intrinsicHeight: 256,
    },
  ],
  [
    tutorChemJpg,
    {
      avifSrcSet: `${tutorChemAvif96} 96w, ${tutorChemAvif192} 192w`,
      webpSrcSet: `${tutorChemWebp96} 96w, ${tutorChemWebp192} 192w`,
      fallbackSrc: tutorChemJpg,
      intrinsicWidth: 256,
      intrinsicHeight: 256,
    },
  ],
  [
    tutorLangJpg,
    {
      avifSrcSet: `${tutorLangAvif96} 96w, ${tutorLangAvif192} 192w`,
      webpSrcSet: `${tutorLangWebp96} 96w, ${tutorLangWebp192} 192w`,
      fallbackSrc: tutorLangJpg,
      intrinsicWidth: 256,
      intrinsicHeight: 256,
    },
  ],
  [
    tutorStemJpg,
    {
      avifSrcSet: `${tutorStemAvif96} 96w, ${tutorStemAvif192} 192w`,
      webpSrcSet: `${tutorStemWebp96} 96w, ${tutorStemWebp192} 192w`,
      fallbackSrc: tutorStemJpg,
      intrinsicWidth: 256,
      intrinsicHeight: 256,
    },
  ],
]);

export function getLocalOptimizedMedia(src?: string | null): LocalMediaBundle | null {
  if (!src) return null;
  return LOCAL_MEDIA_REGISTRY.get(src) || null;
}
