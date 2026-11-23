import React from 'react';
import { Button, ButtonProps } from './Button';

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  ariaLabel: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, ariaLabel, size = 'icon', ...props }, ref) => {
    return (
      <Button ref={ref} size={size} ariaLabel={ariaLabel} {...props}>
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
