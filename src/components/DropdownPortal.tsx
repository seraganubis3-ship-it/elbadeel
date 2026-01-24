'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface DropdownPortalProps {
  children: React.ReactNode;
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLElement>;
  className?: string;
}

export default function DropdownPortal({
  children,
  isOpen,
  triggerRef,
  className = '',
}: DropdownPortalProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // Calculate position to be directly under the input
      const top = rect.bottom + scrollTop;
      const left = rect.left + scrollLeft;
      const width = rect.width;

      setPosition({
        top,
        left,
        width,
      });
    };

    // Initial position calculation
    updatePosition();

    // Update position on scroll and resize
    const handleUpdate = () => updatePosition();

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpen, triggerRef]);

  if (!isOpen || !isMounted) return null;

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={`fixed z-[9999] bg-white border border-gray-300 rounded-xl shadow-2xl max-h-48 overflow-y-auto ${className}`}
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        maxWidth: '400px',
        minWidth: '200px',
      }}
    >
      {children}
    </div>
  );

  // Render to document.body to escape all parent containers
  return createPortal(dropdownContent, document.body);
}
