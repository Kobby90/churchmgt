import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="w-full h-10 rounded-md border border-input flex items-center gap-2 px-3 text-sm"
          type="button"
        >
          <div
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: value }}
          />
          {value}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <HexColorPicker color={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
} 