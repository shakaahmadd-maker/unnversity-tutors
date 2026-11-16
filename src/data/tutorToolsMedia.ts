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

import { registerLocalOptimizedMedia } from './optimizedMedia';

registerLocalOptimizedMedia([
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
