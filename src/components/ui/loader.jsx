import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Loader = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Loader2
      ref={ref}
      className={cn('h-4 w-4 animate-spin', className)}
      {...props}
    />
  );
});

Loader.displayName = 'Loader'; 