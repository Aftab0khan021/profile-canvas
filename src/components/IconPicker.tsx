import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

// Common icons for portfolio items
const COMMON_ICONS = [
  'Code', 'Users', 'Zap', 'Heart', 'Target', 'Lightbulb', 'Star', 'Award',
  'Rocket', 'Brain', 'Sparkles', 'Shield', 'Globe', 'Palette', 'Terminal',
  'Database', 'Cloud', 'Lock', 'Layers', 'GitBranch', 'Coffee', 'Book',
  'Briefcase', 'CheckCircle2', 'MessageCircle', 'TrendingUp', 'Puzzle',
  'Settings', 'Search', 'Eye', 'ThumbsUp', 'Smile', 'Medal', 'Crown',
  'Gem', 'Diamond', 'Flame', 'Sun', 'Moon', 'Music', 'Camera', 'Mic',
];

interface IconPickerProps {
  value?: string | null;
  onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = COMMON_ICONS.filter(icon =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = value ? (LucideIcons as any)[value] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
            {value || 'Select icon...'}
          </span>
          <LucideIcons.ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-5 gap-1 p-2">
            {filteredIcons.map((iconName) => {
              const Icon = (LucideIcons as any)[iconName];
              if (!Icon) return null;
              return (
                <Button
                  key={iconName}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-10 w-10',
                    value === iconName && 'bg-primary text-primary-foreground'
                  )}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                  }}
                  title={iconName}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// Helper component to render dynamic icons
interface DynamicIconProps {
  name: string | null | undefined;
  className?: string;
  fallback?: React.ReactNode;
}

export function DynamicIcon({ name, className, fallback }: DynamicIconProps) {
  if (!name) return fallback || null;
  
  const Icon = (LucideIcons as any)[name];
  if (!Icon) return fallback || null;
  
  return <Icon className={className} />;
}
