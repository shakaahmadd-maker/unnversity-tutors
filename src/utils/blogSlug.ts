export interface BlogSlugCandidate {
  id: string;
  title?: string | null;
  slug?: string | null;
}

export function slugifyBlogTitle(title: string, fallbackId?: string): string {
  const cleaned = String(title || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 110)
    .replace(/-+$/g, '');

  if (cleaned) return cleaned;
  const fallback = String(fallbackId || 'article')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return fallback || 'article';
}

export function getBlogCanonicalSlug(blog: BlogSlugCandidate): string {
  if (blog.slug && typeof blog.slug === 'string') {
    const cleanExplicit = blog.slug
      .toLowerCase()
      .trim()
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (cleanExplicit) return cleanExplicit;
  }
  return slugifyBlogTitle(blog.title || '', blog.id);
}

export function matchesBlogSlugOrId(blog: BlogSlugCandidate, slugOrId: string): boolean {
  const target = decodeURIComponent(String(slugOrId || ''))
    .toLowerCase()
    .trim()
    .replace(/^\/?(blog|our-blog)\//, '')
    .replace(/^\/+|\/+$/g, '');
  if (!target) return false;

  if (String(blog.id || '').toLowerCase().trim() === target) {
    return true;
  }
  if (blog.slug && String(blog.slug).toLowerCase().trim() === target) {
    return true;
  }
  return getBlogCanonicalSlug(blog) === target;
}
