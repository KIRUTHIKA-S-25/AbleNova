'use client';

import React from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';

export const ScreenReaderAnnouncement: React.FC = () => {
  const { announcement } = useAccessibility();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {announcement}
    </div>
  );
};
