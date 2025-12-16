import { Badge } from '@/components/ui/badge';
import { defaultTags } from '@/data/defaultChecklist';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedTags: string[];
  onToggle: (tagId: string) => void;
}

export const TagSelector = ({ selectedTags, onToggle }: TagSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {defaultTags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id);
        return (
          <button
            key={tag.id}
            onClick={() => onToggle(tag.id)}
            className="transition-transform active:scale-95"
          >
            <Badge
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-all',
                isSelected && tag.color === 'primary' && 'bg-primary text-primary-foreground',
                isSelected && tag.color === 'success' && 'bg-success text-success-foreground',
                isSelected && tag.color === 'destructive' && 'bg-destructive text-destructive-foreground',
                isSelected && tag.color === 'warning' && 'bg-warning text-warning-foreground',
                isSelected && tag.color === 'info' && 'bg-info text-info-foreground',
                isSelected && tag.color === 'secondary' && 'bg-secondary text-secondary-foreground',
                isSelected && tag.color === 'accent' && 'bg-accent text-accent-foreground',
                !isSelected && 'hover:bg-muted'
              )}
            >
              {tag.label}
            </Badge>
          </button>
        );
      })}
    </div>
  );
};
