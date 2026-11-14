export interface TutorSlugSource {
  id: string;
  name?: string | null;
  slug?: string | null;
}

const RESERVED_TUTOR_SLUGS = new Set([
  'dashboard',
  'login',
  'signup',
  'admin',
  'auth',
  'api',
  'new',
  'edit',
  'settings',
]);

/**
 * Detects legacy/internal tutor IDs such as `tutor_global_038`, `tutor_clara`, `seed_1`, or UUIDs
 * so they are never treated as canonical name-based slugs.
 */
export function isLegacyTutorId(value?: string | null): boolean {
  const trimmed = String(value || '').trim();
  if (!trimmed) return false;
  if (/^(?:tutor[_-]|seed[_-]|curated[_-]|usr[_-]|user[_-])/i.test(trimmed)) {
    return true;
  }
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return true;
  }
  return false;
}

function sanitizeSlugSegment(raw: string): string {
  return raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function stripPostNominalCredentials(name: string): string {
  return name
    .replace(/,\s*(?:m\.?sc\.?|m\.?ed\.?|ph\.?d\.?|m\.?a\.?|m\.?s\.?|b\.?sc\.?|b\.?a\.?|mba|md|jd|edd|PsyD|cpa|rn)(?:\s*[/,&]\s*(?:m\.?sc\.?|m\.?ed\.?|ph\.?d\.?|m\.?a\.?|m\.?s\.?|b\.?sc\.?|b\.?a\.?|mba|md|jd|edd|PsyD|cpa|rn))*\s*\.?$/i, '')
    .trim();
}

/**
 * Generates a clean, lowercase, hyphenated full-name slug from a tutor's name
 * (e.g., "Dr. Anthony Scott" -> "dr-anthony-scott", "Sarah Jenkins, M.Sc. / M.Ed." -> "sarah-jenkins").
 */
export function slugifyTutorName(name?: string | null, fallbackId?: string | null): string {
  const withoutDegrees = stripPostNominalCredentials(String(name || '').trim());
  const cleanedName = sanitizeSlugSegment(withoutDegrees);
  if (cleanedName) {
    return RESERVED_TUTOR_SLUGS.has(cleanedName) ? `${cleanedName}-tutor` : cleanedName;
  }

  const cleanedFallback = sanitizeSlugSegment(
    String(fallbackId || '')
      .trim()
      .replace(/^tutor_global_/i, 'academic-mentor-')
      .replace(/^tutor[_-]/i, '')
  );
  if (cleanedFallback) {
    return RESERVED_TUTOR_SLUGS.has(cleanedFallback) ? `${cleanedFallback}-tutor` : cleanedFallback;
  }

  return 'academic-tutor';
}

/**
 * Secondary helper for fuzzy matching when a visitor omits an honorific (e.g., "anthony-scott" vs "dr-anthony-scott").
 */
export function slugifyTutorNameWithoutHonorific(name?: string | null): string {
  const stripped = stripPostNominalCredentials(String(name || '').trim()).replace(
    /^(?:(?:dr|prof|professor|mr|ms|mrs)\.?\s+)+/i,
    ''
  );
  return sanitizeSlugSegment(stripped);
}

function getTutorSortPriority(id: string): number {
  return /^tutor_global_/i.test(id) ? 1 : 0;
}

/**
 * Deterministically assigns unique name-based slugs across a collection of tutors.
 * If two or more tutors share the exact same base name slug, appends `-2`, `-3`, etc.
 */
export function assignUniqueTutorSlugs<T extends TutorSlugSource>(
  tutors: readonly T[]
): Map<string, string> {
  const slugById = new Map<string, string>();
  const usedSlugs = new Set<string>();
  const nextSuffixByBase = new Map<string, number>();

  const sorted = [...tutors]
    .filter((t): t is T => Boolean(t && t.id))
    .sort((a, b) => {
      const idA = String(a.id);
      const idB = String(b.id);
      const prioDiff = getTutorSortPriority(idA) - getTutorSortPriority(idB);
      if (prioDiff !== 0) return prioDiff;
      return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
    });

  for (const tutor of sorted) {
    const tutorId = String(tutor.id);
    if (slugById.has(tutorId)) continue;

    const explicitCustomSlug =
      tutor.slug && tutor.slug.trim() && !isLegacyTutorId(tutor.slug)
        ? slugifyTutorName(tutor.slug)
        : '';
    const baseSlug = explicitCustomSlug || slugifyTutorName(tutor.name, tutorId);

    let assignedSlug = baseSlug;
    if (usedSlugs.has(assignedSlug)) {
      let suffix = nextSuffixByBase.get(baseSlug) || 2;
      while (usedSlugs.has(`${baseSlug}-${suffix}`)) {
        suffix += 1;
      }
      assignedSlug = `${baseSlug}-${suffix}`;
      nextSuffixByBase.set(baseSlug, suffix + 1);
    } else {
      nextSuffixByBase.set(baseSlug, 2);
    }

    usedSlugs.add(assignedSlug);
    slugById.set(tutorId, assignedSlug);
  }

  return slugById;
}

/**
 * Returns a copy of the tutors array with unique `slug` populated on every item,
 * preserving the caller's original ordering.
 */
export function withAssignedTutorSlugs<T extends TutorSlugSource>(
  tutors: readonly T[]
): Array<T & { slug: string }> {
  const slugMap = assignUniqueTutorSlugs(tutors);
  return tutors.map((tutor) => ({
    ...tutor,
    slug: slugMap.get(String(tutor.id)) || getTutorCanonicalSlug(tutor),
  }));
}

/**
 * Returns the canonical URL slug for a single tutor record.
 */
export function getTutorCanonicalSlug(
  tutor: TutorSlugSource,
  slugMap?: Map<string, string>
): string {
  const id = String(tutor?.id || '').trim();
  if (id && slugMap?.has(id)) {
    return slugMap.get(id)!;
  }
  if (tutor?.slug && tutor.slug.trim() && !isLegacyTutorId(tutor.slug)) {
    return slugifyTutorName(tutor.slug, id);
  }
  return slugifyTutorName(tutor?.name, id);
}

/**
 * Checks whether a URL route parameter matches a tutor by canonical slug, legacy ID, or name slug.
 */
export function matchesTutorSlugOrId(
  tutor: TutorSlugSource,
  rawParam: string,
  slugMap?: Map<string, string>
): boolean {
  if (!tutor || !rawParam) return false;
  let decoded = rawParam;
  try {
    decoded = decodeURIComponent(rawParam);
  } catch {
    decoded = rawParam;
  }
  const clean = decoded.trim();
  if (!clean) return false;
  const lower = clean.toLowerCase();

  const canonicalSlug = getTutorCanonicalSlug(tutor, slugMap);
  if (lower === canonicalSlug) return true;

  const tutorId = String(tutor.id || '').trim();
  if (tutorId && (tutorId === clean || tutorId.toLowerCase() === lower)) return true;

  const normalizedParamSlug = sanitizeSlugSegment(clean);
  if (!normalizedParamSlug) return false;

  if (normalizedParamSlug === canonicalSlug) return true;
  if (tutorId && sanitizeSlugSegment(tutorId) === normalizedParamSlug) return true;

  if (tutor.name) {
    if (slugifyTutorName(tutor.name) === normalizedParamSlug) return true;
    if (sanitizeSlugSegment(tutor.name) === normalizedParamSlug) return true;
    const strippedHonorific = slugifyTutorNameWithoutHonorific(tutor.name);
    if (strippedHonorific && strippedHonorific === normalizedParamSlug) return true;
  }

  return false;
}
