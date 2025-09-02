
'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

type AgeSliderProps = {
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step: number;
};

export default function AgeSlider({ value, onValueChange, min, max, step }: AgeSliderProps) {
  return (
    <div className="pt-2 px-1">
      <div className="flex justify-between items-center mb-2">
        <Label htmlFor="age-range" className="text-xs">
          Age Range
        </Label>
        <span className="text-xs text-muted-foreground font-mono">
          {value[0]} - {value[1]}
        </span>
      </div>
      <Slider
        id="age-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={onValueChange}
        className="w-full"
      />
    </div>
  );
}
