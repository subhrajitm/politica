
'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

type MultiSelectFilterProps = {
  title: string;
  options: {
    label: string;
    value: string;
  }[];
  selectedValues: string[];
  onValueChange: (selected: string[]) => void;
};

export function MultiSelectFilter({
  title,
  options,
  selectedValues,
  onValueChange,
}: MultiSelectFilterProps) {

  const handleSelect = (value: string) => {
    const isSelected = selectedValues.includes(value);
    if (isSelected) {
      onValueChange(selectedValues.filter((v) => v !== value));
    } else {
      onValueChange([...selectedValues, value]);
    }
  };

  const getButtonText = () => {
    if (selectedValues.length === 0) {
      return `All ${title}s`;
    }
    if (selectedValues.length === 1) {
      return selectedValues[0];
    }
    return `${selectedValues.length} ${title}s selected`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full text-xs h-8 justify-between">
          <span className="truncate">{getButtonText()}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{`Filter by ${title}`}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues.includes(option.value)}
            onSelect={(e) => {
                e.preventDefault();
                handleSelect(option.value);
            }}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
