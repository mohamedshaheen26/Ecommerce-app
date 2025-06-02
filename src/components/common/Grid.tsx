import type { ReactNode } from 'react';

interface GridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 2 | 4 | 6 | 8;
  className?: string;
}

export default function Grid({ 
  children, 
  columns = 2, 
  gap = 6,
  className = ''
}: GridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6'
  };

  const gapSizes = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  };

  return (
    <div className={`grid ${gridCols[columns]} ${gapSizes[gap]} ${className}`}>
      {children}
    </div>
  );
} 