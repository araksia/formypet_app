import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useImageLoading } from '@/hooks/useImageLoading';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  webpSrc?: string;
  fallbackSrc?: string;
  lazyLoad?: boolean;
  aspectRatio?: string;
  skeleton?: boolean;
  errorFallback?: React.ReactNode;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  webpSrc,
  fallbackSrc,
  lazyLoad = true,
  aspectRatio,
  skeleton = true,
  errorFallback,
  className,
  ...props
}: OptimizedImageProps) {
  const { elementRef, isVisible } = useIntersectionObserver({
    triggerOnce: true,
    threshold: 0.1,
  });

  const shouldLoad = !lazyLoad || isVisible;
  const { isLoading, hasError, currentSrc } = useImageLoading({
    src: shouldLoad ? src : '',
    webpSrc: shouldLoad ? webpSrc : undefined,
    fallbackSrc: shouldLoad ? fallbackSrc : undefined,
  });

  const containerStyle = aspectRatio 
    ? { aspectRatio } 
    : {};

  if (hasError && errorFallback) {
    return (
      <div 
        ref={elementRef}
        className={cn('flex items-center justify-center bg-muted', className)}
        style={containerStyle}
      >
        {errorFallback}
      </div>
    );
  }

  if (hasError) {
    return (
      <div 
        ref={elementRef}
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground text-sm',
          className
        )}
        style={containerStyle}
      >
        <span>⚠️ Failed to load image</span>
      </div>
    );
  }

  if (!shouldLoad || (isLoading && skeleton)) {
    return (
      <div ref={elementRef} className={className} style={containerStyle}>
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div ref={elementRef} className={className} style={containerStyle}>
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        {...props}
      />
    </div>
  );
}