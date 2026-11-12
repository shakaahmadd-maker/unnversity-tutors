import React from 'react';

export type DedicatedServiceId = '1on1' | 'assignment' | 'coursework' | 'essay';
export type DedicatedServiceView =
  | 'service-1on1'
  | 'service-assignment'
  | 'service-coursework'
  | 'service-essay';

export interface DedicatedServiceRoute {
  id: DedicatedServiceId;
  view: DedicatedServiceView;
  path: string;
  aliases: string[];
  label: string;
  shortDesc: string;
  breadcrumbTitle: string;
  seoTitle: string;
  seoDescription: string;
}

export const DEDICATED_SERVICE_ROUTES: DedicatedServiceRoute[] = [
  {
    id: '1on1',
    view: 'service-1on1',
    path: '/services/1-on-1-live-tutoring',
    aliases: [
      '1on1',
      'service-1on1',
      'services/1-on-1-live-tutoring',
      'services/1on1',
      '1-on-1-live-tutoring',
      '1-on-1-online-tutoring',
      '1-on-1-online-mentorship',
    ],
    label: '1-on-1 Live Tutoring',
    shortDesc: 'Interactive webcam & digital whiteboard coaching',
    breadcrumbTitle: '1-on-1 Online Tutoring',
    seoTitle: '1-on-1 Live Online Tutoring - University Tutors',
    seoDescription:
      'Personalized 1-on-1 live online tutoring with interactive whiteboards, HD video, and verified university faculty across STEM, humanities, and test prep.',
  },
  {
    id: 'assignment',
    view: 'service-assignment',
    path: '/services/assignment-guidance',
    aliases: [
      'assignment',
      'service-assignment',
      'services/assignment-guidance',
      'services/assignment',
    ],
    label: 'Assignment Guidance',
    shortDesc: 'Rubric analysis, logic maps & reference outlines',
    breadcrumbTitle: 'Assignment Guidance',
    seoTitle: 'Assignment Guidance & Reference Outlines - University Tutors',
    seoDescription:
      'Ethical 1-on-1 assignment guidance, rubric analysis, formula derivation blueprints, and structural academic outlines aligned with university honor codes.',
  },
  {
    id: 'coursework',
    view: 'service-coursework',
    path: '/services/coursework-track',
    aliases: [
      'coursework',
      'service-coursework',
      'services/coursework-track',
      'services/coursework',
      'coursework-track',
      'semester-coursework-tracks',
    ],
    label: 'Coursework Track',
    shortDesc: '14-week syllabus-mapped semester mentoring',
    breadcrumbTitle: 'Semester Coursework Tracks',
    seoTitle: 'Semester-Long Coursework Track - University Tutors',
    seoDescription:
      'Syllabus-mapped 14-week semester coursework tracks with weekly milestone coaching, continuous assessment preparation, and exam readiness.',
  },
  {
    id: 'essay',
    view: 'service-essay',
    path: '/services/essay-reference-checks',
    aliases: [
      'essay',
      'service-essay',
      'services/essay-reference-checks',
      'services/essay',
      'services/academic-writing',
      'essay-reference-checks',
      'essay-rhetoric-citations',
    ],
    label: 'Essay & Reference Checks',
    shortDesc: 'Thesis rhetoric, APA/MLA/Harvard citation checks',
    breadcrumbTitle: 'Essay Rhetoric & Citations',
    seoTitle: 'Essay Rhetoric, Citations & Reference Checks - University Tutors',
    seoDescription:
      'Master academic thesis formulation, logical prose structure, and accurate APA, MLA, Harvard, and Chicago citation verification with vetted writing mentors.',
  },
];

export function getDedicatedServiceById(id: string | null | undefined): DedicatedServiceRoute | null {
  if (!id) return null;
  return DEDICATED_SERVICE_ROUTES.find((r) => r.id === id) || null;
}

export function resolveDedicatedServiceRoute(rawInput: string | null | undefined): DedicatedServiceRoute | null {
  if (!rawInput) return null;
  const cleaned = rawInput
    .toLowerCase()
    .trim()
    .replace(/^[#/]+/, '')
    .replace(/\/+$/, '')
    .split('?')[0]
    .split('#')[0];

  if (!cleaned) return null;

  return (
    DEDICATED_SERVICE_ROUTES.find(
      (route) =>
        route.view === cleaned ||
        route.path.replace(/^\//, '') === cleaned ||
        route.aliases.includes(cleaned)
    ) || null
  );
}

export function isModifiedAnchorClick(e: React.MouseEvent<HTMLAnchorElement>): boolean {
  return Boolean(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0);
}
