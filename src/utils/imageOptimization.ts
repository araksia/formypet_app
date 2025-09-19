interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
}

export function getOptimizedImageUrl(
  originalUrl: string, 
  options: ImageOptimizationOptions = {}
): string {
  // For static assets, we'll use the original URL as-is since we don't have a CDN
  // In a production app, you'd integrate with services like Cloudinary, ImageKit, etc.
  return originalUrl;
}

export function generateWebPUrl(originalUrl: string): string {
  // Convert extension to webp
  const extension = originalUrl.split('.').pop()?.toLowerCase();
  if (extension && ['jpg', 'jpeg', 'png'].includes(extension)) {
    return originalUrl.replace(new RegExp(`\\.${extension}$`, 'i'), '.webp');
  }
  return originalUrl;
}

export function generateSrcSet(
  baseUrl: string,
  sizes: number[] = [320, 640, 768, 1024, 1280]
): string {
  // For static assets, return the original URL
  // In production, you'd generate multiple sizes
  return sizes.map(size => `${baseUrl} ${size}w`).join(', ');
}

export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function compressImage(
  file: File, 
  quality: number = 0.8,
  maxWidth: number = 1920
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to blob conversion failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}