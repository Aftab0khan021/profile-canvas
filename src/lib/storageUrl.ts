/**
 * storageUrl.ts
 *
 * Converts raw Supabase storage URLs into clean proxy paths served by Vercel rewrites.
 * This hides the Supabase project ID, bucket name, and storage internals from users.
 *
 * Raw:   https://dwdhjkthnthbyxwouqnc.supabase.co/storage/v1/object/public/portfolio-images/UUID/file.jpg
 * Clean: /img/UUID/file.jpg
 *
 * Raw:   https://dwdhjkthnthbyxwouqnc.supabase.co/storage/v1/object/public/portfolio-files/UUID/resume.pdf
 * Clean: /files/UUID/resume.pdf
 *
 * Vercel rewrites in vercel.json transparently proxy these back to Supabase at the edge.
 * External URLs (github.com, linkedin.com, etc.) are returned unchanged.
 */

const SUPABASE_STORAGE_PREFIX =
  'https://dwdhjkthnthbyxwouqnc.supabase.co/storage/v1/object/public/';

/** Supabase image transformation URL prefix (used when transform options are passed to getPublicUrl) */
const SUPABASE_RENDER_PREFIX =
  'https://dwdhjkthnthbyxwouqnc.supabase.co/storage/v1/render/image/public/';

/** Bucket → proxy path prefix map */
const BUCKET_PROXY: Record<string, string> = {
  'portfolio-images': '/img',
  'portfolio-files': '/files',
};

/**
 * Masks a Supabase storage URL to a clean Vercel proxy path.
 * Returns the original URL unchanged if it is not a Supabase storage URL.
 */
export function maskStorageUrl(url: string | null | undefined): string {
  if (!url) return '';

  // Handle both regular storage URLs and image transform URLs
  let prefix: string | null = null;
  if (url.startsWith(SUPABASE_STORAGE_PREFIX)) {
    prefix = SUPABASE_STORAGE_PREFIX;
  } else if (url.startsWith(SUPABASE_RENDER_PREFIX)) {
    prefix = SUPABASE_RENDER_PREFIX;
  }

  if (!prefix) {
    // Not a Supabase storage URL — return as-is (external links, placeholders, etc.)
    return url;
  }

  // Strip the known prefix to get "bucket/rest/of/path" (may include query params for transforms)
  const withoutPrefix = url.slice(prefix.length);

  // Find which bucket this belongs to (path may include ?width=...&quality=... query params)
  for (const [bucket, proxyPrefix] of Object.entries(BUCKET_PROXY)) {
    if (withoutPrefix.startsWith(bucket + '/')) {
      const filePath = withoutPrefix.slice(bucket.length + 1); // strip "bucket/"
      return `${proxyPrefix}/${filePath}`;
    }
  }

  // Unknown bucket — still hide the Supabase domain by stripping it entirely,
  // but we can't proxy it. Return blank to avoid leaking the URL.
  return '';
}

/**
 * Returns true if the URL is a Supabase storage URL that will be masked.
 */
export function isStorageUrl(url: string | null | undefined): boolean {
  return !!url && url.startsWith(SUPABASE_STORAGE_PREFIX);
}
