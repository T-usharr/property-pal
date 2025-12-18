import { useState } from 'react';
import { ChecklistCategory as ChecklistCategoryType, ChecklistItem } from '@/types/property';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DebouncedInput } from '@/components/ui/debounced-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DebouncedTextarea } from '@/components/ui/debounced-textarea';
import { ChevronDown, ChevronUp, AlertTriangle, Star, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistCategoryProps {
  category: ChecklistCategoryType;
  onUpdate: (categoryId: string, itemId: string, value: string | boolean | number | null, note?: string) => void;
}

export const ChecklistCategory = ({ category, onUpdate }: ChecklistCategoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeNoteItem, setActiveNoteItem] = useState<string | null>(null);

  const completedCount = category.items.filter((item) => {
    if (item.type === 'checkbox') return item.value === true;
    if (item.type === 'text') return item.value && (item.value as string).trim() !== '';
    if (item.type === 'number') return item.value !== null && item.value !== '';
    if (item.type === 'select') return item.value !== null;
    if (item.type === 'rating') return item.value !== null && item.value !== 0;
    return false;
  }).length;

  const renderInput = (item: ChecklistItem) => {
    switch (item.type) {
      case 'checkbox':
        return (
          <Checkbox
            checked={item.value as boolean}
            onCheckedChange={(checked) => onUpdate(category.id, item.id, checked as boolean)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        );

      case 'text':
        return (
          <DebouncedInput
            value={(item.value as string) || ''}
            onChange={(value) => onUpdate(category.id, item.id, value)}
            placeholder="Enter value..."
            className="h-9 text-sm bg-background"
            debounceMs={400}
          />
        );

      case 'number':
        return (
          <DebouncedInput
            type="number"
            value={item.value !== null ? String(item.value) : ''}
            onChange={(value) => onUpdate(category.id, item.id, value ? parseFloat(value) : null)}
            placeholder="0"
            className="h-9 text-sm w-24 bg-background"
            debounceMs={400}
          />
        );

      case 'select':
        return (
          <Select
            value={(item.value as string) || ''}
            onValueChange={(value) => onUpdate(category.id, item.id, value || null)}
          >
            <SelectTrigger className="h-9 text-sm bg-background">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {item.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'rating':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onUpdate(category.id, item.id, star)}
                className="p-0.5 hover:scale-110 transition-transform"
              >
                <Star
                  className={cn(
                    'w-5 h-5',
                    star <= (item.value as number || 0)
                      ? 'fill-primary text-primary'
                      : 'text-muted'
                  )}
                />
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden border-border/50 animate-fade-in">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div className="text-left">
            <h3 className="font-display font-semibold text-card-foreground">
              {category.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {completedCount}/{category.items.length} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / category.items.length) * 100}%` }}
            />
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 animate-slide-up">
          {category.items.map((item) => (
            <div key={item.id} className="space-y-2">
              <div
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg bg-muted/30',
                  item.redFlag && item.value === true && 'bg-destructive/10 border border-destructive/30'
                )}
              >
                <div className="flex-1 min-w-0">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    {item.label}
                    {item.redFlag && (
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    )}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  {renderInput(item)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNoteItem(activeNoteItem === item.id ? null : item.id);
                    }}
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      item.note ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {activeNoteItem === item.id && (
                <DebouncedTextarea
                  value={item.note || ''}
                  onChange={(value) => onUpdate(category.id, item.id, item.value, value)}
                  placeholder="Add a note..."
                  className="text-sm min-h-[80px] bg-background"
                  debounceMs={400}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
