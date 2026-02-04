import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: SearchBarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
        aria-label="Search"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
