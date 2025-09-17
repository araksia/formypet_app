import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((item: T, index: number) => number);
  renderItem: (item: T, index: number, isVisible: boolean) => React.ReactNode;
  containerHeight: number;
  overscan?: number;
  className?: string;
  gap?: number;
}

interface VirtualItem {
  index: number;
  offsetTop: number;
  height: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  containerHeight,
  overscan = 5,
  className = '',
  gap = 0,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate item positions
  const virtualItems = useMemo<VirtualItem[]>(() => {
    const virtualItems: VirtualItem[] = [];
    let offsetTop = 0;

    for (let i = 0; i < items.length; i++) {
      const height = typeof itemHeight === 'function' ? itemHeight(items[i], i) : itemHeight;
      
      virtualItems.push({
        index: i,
        offsetTop,
        height,
      });

      offsetTop += height + gap;
    }

    return virtualItems;
  }, [items, itemHeight, gap]);

  // Calculate total height
  const totalHeight = virtualItems.length > 0 
    ? virtualItems[virtualItems.length - 1].offsetTop + virtualItems[virtualItems.length - 1].height
    : 0;

  // Calculate visible range
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const containerTop = scrollTop;
    const containerBottom = scrollTop + containerHeight;

    let startIndex = 0;
    let endIndex = 0;

    // Find start index
    for (let i = 0; i < virtualItems.length; i++) {
      const item = virtualItems[i];
      if (item.offsetTop + item.height >= containerTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
    }

    // Find end index
    for (let i = startIndex; i < virtualItems.length; i++) {
      const item = virtualItems[i];
      if (item.offsetTop > containerBottom) {
        endIndex = Math.min(virtualItems.length - 1, i + overscan);
        break;
      }
      endIndex = Math.min(virtualItems.length - 1, i + overscan);
    }

    const visibleItems = virtualItems.slice(startIndex, endIndex + 1);

    return { startIndex, endIndex, visibleItems };
  }, [virtualItems, scrollTop, containerHeight, overscan]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          const isVisible = virtualItem.index >= startIndex && virtualItem.index <= endIndex;
          
          return (
            <div
              key={virtualItem.index}
              style={{
                position: 'absolute',
                top: virtualItem.offsetTop,
                width: '100%',
                height: virtualItem.height,
              }}
            >
              {renderItem(item, virtualItem.index, isVisible)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Hook for dynamic height measurement
export function useDynamicHeight<T>(items: T[]) {
  const [heights, setHeights] = useState<Map<number, number>>(new Map());
  
  const measureHeight = (index: number, height: number) => {
    setHeights(prev => {
      const newMap = new Map(prev);
      newMap.set(index, height);
      return newMap;
    });
  };

  const getHeight = (index: number, defaultHeight: number = 100) => {
    return heights.get(index) ?? defaultHeight;
  };

  return { measureHeight, getHeight };
}