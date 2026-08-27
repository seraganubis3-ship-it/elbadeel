'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface KeyboardListNavigationOptions {
  idPrefix: string;
  itemCount: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (index: number) => void;
}

export function useKeyboardListNavigation({
  idPrefix,
  itemCount,
  isOpen,
  onOpen,
  onClose,
  onSelect,
}: KeyboardListNavigationOptions) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const optionRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (!isOpen || itemCount === 0) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex(current => (current >= 0 && current < itemCount ? current : 0));
  }, [isOpen, itemCount]);

  useEffect(() => {
    if (activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent): boolean => {
      if (itemCount === 0) {
        if (event.key === 'Escape' && isOpen) {
          event.preventDefault();
          onClose();
          return true;
        }
        return false;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        onOpen();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        setActiveIndex(current => {
          if (current < 0) return direction > 0 ? 0 : itemCount - 1;
          return (current + direction + itemCount) % itemCount;
        });
        return true;
      }

      if (isOpen && (event.key === 'Home' || event.key === 'End')) {
        event.preventDefault();
        setActiveIndex(event.key === 'Home' ? 0 : itemCount - 1);
        return true;
      }

      if (isOpen && event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault();
        onSelect(activeIndex);
        return true;
      }

      if (isOpen && event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return true;
      }

      if (isOpen && event.key === 'Tab') onClose();
      return false;
    },
    [activeIndex, isOpen, itemCount, onClose, onOpen, onSelect]
  );

  const getOptionProps = useCallback(
    (index: number) => ({
      id: `${idPrefix}-${index}`,
      role: 'option' as const,
      'aria-selected': activeIndex === index,
      ref: (element: HTMLElement | null) => {
        optionRefs.current[index] = element;
      },
      onMouseEnter: () => setActiveIndex(index),
    }),
    [activeIndex, idPrefix]
  );

  return {
    activeIndex,
    activeDescendantId: activeIndex >= 0 ? `${idPrefix}-${activeIndex}` : undefined,
    getOptionProps,
    handleKeyDown,
  };
}
