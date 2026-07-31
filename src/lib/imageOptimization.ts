import { maskStorageUrl } from '@/lib/storageUrl';


export interface ImageTransformOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'origin';
}

/**
 * Get optimized image URL from Supabase Storage with transformations.
 * The returned URL is always a clean proxy path — the Supabase project ID
 * and bucket name are never exposed to the user.
 *
 * @param path - Image path in storage or full Supabase URL
 * @param options - Transformation options
 * @returns Masked, optimized image URL
 */
export function getOptimizedImageUrl(
    path: string | null | undefined,
    options: ImageTransformOptions = {}
): string {
    if (!path) return '/placeholder.svg';

    // Non-Supabase external URL (github, cdn, etc.) — return unchanged
    if ((path.startsWith('http://') || path.startsWith('https://')) &&
        !path.includes('supabase.co')) {
        return path;
    }

    // If already a masked proxy path, return as-is
    if (path.startsWith('/img/') || path.startsWith('/files/')) {
        return path;
    }

    // Mask the Supabase storage URL to the clean proxy path
    // (We use the direct object URL so the /img/ Vercel proxy works correctly.
    //  Supabase image transforms use a different URL scheme that the proxy doesn't handle.)
    const masked = maskStorageUrl(path);
    return masked || '/placeholder.svg';
}

/**
 * Preset image sizes for common use cases
 */
export const IMAGE_PRESETS = {
    thumbnail: { width: 200, height: 200, quality: 70, format: 'webp' as const },
    card: { width: 400, height: 300, quality: 80, format: 'webp' as const },
    hero: { width: 1200, height: 600, quality: 85, format: 'webp' as const },
    full: { width: 1920, quality: 90, format: 'webp' as const },
    avatar: { width: 150, height: 150, quality: 80, format: 'webp' as const },
} as const;

/**
 * Get responsive srcset for an image (all URLs masked)
 */
export function getResponsiveSrcSet(
    path: string | null | undefined,
    sizes: number[] = [400, 800, 1200, 1600]
): string {
    if (!path) return '';
    return sizes
        .map(width => {
            const url = getOptimizedImageUrl(path, { width, format: 'webp' });
            return `${url} ${width}w`;
        })
        .join(', ');
}
