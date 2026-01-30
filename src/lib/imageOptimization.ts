import { supabase } from '@/integrations/supabase/client';

export interface ImageTransformOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'origin';
}

/**
 * Get optimized image URL from Supabase Storage with transformations
 * @param path - Image path in storage or full URL
 * @param options - Transformation options
 * @returns Optimized image URL or original URL as fallback
 */
export function getOptimizedImageUrl(
    path: string | null | undefined,
    options: ImageTransformOptions = {}
): string {
    // Return placeholder if no path
    if (!path) return '/placeholder.svg';

    // If it's already a full URL (http/https), return it as-is
    // Supabase transformations only work on storage paths, not external URLs
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const {
        width = 800,
        height,
        quality = 80,
        format = 'webp'
    } = options;

    try {
        // Try to get optimized URL from Supabase storage
        const { data } = supabase.storage
            .from('portfolio-images')
            .getPublicUrl(path, {
                transform: {
                    width,
                    height,
                    quality,
                    format: format as 'origin', // Type assertion for Supabase compatibility
                },
            });

        return data.publicUrl;
    } catch (error) {
        console.error('Error getting optimized image URL:', error);
        // Fallback to original path if transformation fails
        return path;
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
 * Get responsive srcset for an image
 * @param path - Image path in storage
 * @param sizes - Array of widths to generate
 * @returns srcset string
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
