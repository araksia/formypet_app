import { useState, useEffect } from 'react';

interface UseImageLoadingOptions {
  src: string;
  webpSrc?: string;
  fallbackSrc?: string;
}

export function useImageLoading({ src, webpSrc, fallbackSrc }: UseImageLoadingOptions) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    // Check if browser supports WebP
    const supportsWebP = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    // Try loading images in order: webp -> original -> fallback
    const tryLoadImage = (imageSrc: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(imageSrc);
        img.onerror = reject;
        img.src = imageSrc;
      });
    };

    const loadImage = async () => {
      try {
        let imagesToTry: string[] = [];
        
        // Add WebP if supported and available
        if (webpSrc && supportsWebP()) {
          imagesToTry.push(webpSrc);
        }
        
        // Add original source
        if (src) {
          imagesToTry.push(src);
        }
        
        // Add fallback
        if (fallbackSrc) {
          imagesToTry.push(fallbackSrc);
        }

        // Try each image source in order
        for (const imageSrc of imagesToTry) {
          try {
            const loadedSrc = await tryLoadImage(imageSrc);
            setCurrentSrc(loadedSrc);
            setIsLoading(false);
            return;
          } catch {
            continue;
          }
        }

        // If all sources fail
        throw new Error('All image sources failed to load');
      } catch {
        setHasError(true);
        setIsLoading(false);
      }
    };

    if (src || webpSrc || fallbackSrc) {
      loadImage();
    }
  }, [src, webpSrc, fallbackSrc]);

  return { isLoading, hasError, currentSrc };
}