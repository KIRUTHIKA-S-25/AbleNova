import React, { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { trapFocus } from '@/utils/a11y';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${title.toLowerCase().replace(/\s+/g, '-')}`;

  useEffect(() => {
    if (!isOpen) return;

    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (modalElement) {
        trapFocus(modalElement, e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full max-w-lg bg-white dark:bg-slate-900 border-3 border-slate-300 dark:border-yellow-400 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 focus-visible:outline-none',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 id={titleId} className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <IconButton
            icon={<X className="w-5 h-5" />}
            ariaLabel="Close modal dialog"
            variant="ghost"
            onClick={onClose}
          />
        </div>

        {/* Body */}
        <div className="flex-1 text-base text-slate-800 dark:text-slate-200 overflow-y-auto max-h-[60vh]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
