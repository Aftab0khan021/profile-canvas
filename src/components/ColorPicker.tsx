import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const presetColors = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#a855f7', // purple
];

interface ColorPickerProps {
  value?: string | null;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value = '#3b82f6', onChange, className }: ColorPickerProps) {
  const currentColor = value || '#3b82f6';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start gap-2", className)}
        >
          <div
            className="h-5 w-5 rounded border"
            style={{ backgroundColor: currentColor }}
          />
          <span className="font-mono text-sm">{currentColor}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "h-8 w-8 rounded-lg border-2 transition-transform hover:scale-110",
                  currentColor === color ? "border-foreground" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
                onClick={() => onChange(color)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="color"
              value={currentColor}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={currentColor}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#3b82f6"
              className="font-mono"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
