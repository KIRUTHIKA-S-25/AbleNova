import React from 'react';

/**
 * Handle Enter or Space key down events for custom accessible interactive elements
 */
export function handleActionKeyDown(
  event: React.KeyboardEvent,
  action: () => void
) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
}

/**
 * Handle Escape key down event for modals, dialogs, and popovers
 */
export function handleEscapeKey(
  event: React.KeyboardEvent,
  onClose: () => void
) {
  if (event.key === 'Escape') {
    event.preventDefault();
    onClose();
  }
}

/**
 * Trap focus within a given container element (useful for modals and dialogs)
 */
export function trapFocus(container: HTMLElement, event: KeyboardEvent) {
  if (event.key !== 'Tab') return;

  const focusables = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusables.length === 0) return;

  const firstFocusable = focusables[0];
  const lastFocusable = focusables[focusables.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    }
  } else {
    if (document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  }
}
