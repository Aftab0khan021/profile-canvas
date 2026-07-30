import { supabase } from '@/integrations/supabase/client';
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

    const {
        width = 800,
        height,
        quality = 80,
        format = 'webp'
    } = options;

    // If it's a full Supabase URL, extract just the storage path for the SDK call
    const STORAGE_OBJECT_PREFIX =
        'https://dwdhjkthnthbyxwouqnc.supabase.co/storage/v1/object/public/portfolio-images/';
    let storagePath = path;
    if (path.startsWith(STORAGE_OBJECT_PREFIX)) {
        storagePath = path.slice(STORAGE_OBJECT_PREFIX.length);
    }

    try {
        const { data } = supabase.storage
            .from('portfolio-images')
            .getPublicUrl(storagePath, {
                transform: {
                    width,
                    height,
                    quality,
                    format: format as 'origin',
                },
            });

        // Always mask — never expose the raw Supabase URL
        return maskStorageUrl(data.publicUrl) || maskStorageUrl(path) || '/placeholder.svg';
    } catch {
        // Silently fall back to masked original URL
        return maskStorageUrl(path) || '/placeholder.svg';
    }
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
