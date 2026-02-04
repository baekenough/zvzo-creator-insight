import * as React from 'react';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  className,
}: FilterDropdownProps) {
  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
