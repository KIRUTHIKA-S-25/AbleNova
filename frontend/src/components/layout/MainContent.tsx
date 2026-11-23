import React from 'react';
import { cn } from '@/utils/cn';

export interface MainContentProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({ children, className, ...props }) => {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn('flex-1 focus-visible:outline-none py-6 px-4 md:px-8 max-w-7xl w-full mx-auto', className)}
      {...props}
    >
      {children}
    </main>
  );
};
