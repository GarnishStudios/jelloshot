import React from 'react';
import { ArrowUpDown, Calendar, SortAsc } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export type SortOption = 'date' | 'name';
export type SortOrder = 'asc' | 'desc';

interface SortSelectorProps {
  value: SortOption;
  order: SortOrder;
  onSortChange: (option: SortOption) => void;
  onOrderChange: (order: SortOrder) => void;
  className?: string;
}

export const SortSelector: React.FC<SortSelectorProps> = ({
  value,
  order,
  onSortChange,
  onOrderChange,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
      <div className="flex items-center gap-1 p-1 bg-muted/50 backdrop-blur-sm border border-border rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (value === 'date') {
              onOrderChange(order === 'asc' ? 'desc' : 'asc');
            } else {
              onSortChange('date');
              onOrderChange('desc');
            }
          }}
          className={cn(
            "relative flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200",
            value === 'date'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Calendar className="h-4 w-4" />
          <span className="text-xs font-medium hidden sm:inline">Date</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (value === 'name') {
              onOrderChange(order === 'asc' ? 'desc' : 'asc');
            } else {
              onSortChange('name');
              onOrderChange('asc');
            }
          }}
          className={cn(
            "relative flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200",
            value === 'name'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <SortAsc className="h-4 w-4" />
          <span className="text-xs font-medium hidden sm:inline">Name</span>
        </Button>
      </div>
      
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOrderChange(order === 'asc' ? 'desc' : 'asc')}
          className="p-1.5 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
          title={order === 'asc' ? 'Ascending' : 'Descending'}
        >
          <ArrowUpDown className={cn(
            "h-4 w-4 transition-transform duration-200",
            order === 'desc' && "rotate-180"
          )} />
        </Button>
      )}
    </div>
  );
};

