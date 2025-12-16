import { Property } from '@/types/property';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Star, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { defaultTags } from '@/data/defaultChecklist';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export const PropertyCard = ({ property, onClick }: PropertyCardProps) => {
  const completedItems = property.checklist.reduce((acc, cat) => {
    return acc + cat.items.filter((item) => {
      if (item.type === 'checkbox') return item.value === true;
      if (item.type === 'text') return item.value && (item.value as string).trim() !== '';
      if (item.type === 'number') return item.value !== null && item.value !== '';
      if (item.type === 'select') return item.value !== null;
      if (item.type === 'rating') return item.value !== null && item.value !== 0;
      return false;
    }).length;
  }, 0);

  const totalItems = property.checklist.reduce((acc, cat) => acc + cat.items.length, 0);
  const progress = Math.round((completedItems / totalItems) * 100);

  return (
    <Card
      onClick={onClick}
      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-border/50 bg-card animate-slide-up"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-lg text-card-foreground truncate">
            {property.name}
          </h3>
          <p className="text-muted-foreground text-sm truncate flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {property.address || 'No address'}
          </p>
          {property.builderName && (
            <p className="text-muted-foreground text-xs mt-0.5">
              by {property.builderName}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-4 h-4',
                  star <= property.rating
                    ? 'fill-primary text-primary'
                    : 'text-muted'
                )}
              />
            ))}
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {property.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {property.tags.map((tagId) => {
            const tag = defaultTags.find((t) => t.id === tagId);
            if (!tag) return null;
            return (
              <Badge
                key={tagId}
                variant="secondary"
                className={cn(
                  'text-xs',
                  tag.color === 'primary' && 'bg-primary/20 text-primary',
                  tag.color === 'success' && 'bg-success/20 text-success',
                  tag.color === 'destructive' && 'bg-destructive/20 text-destructive',
                  tag.color === 'warning' && 'bg-warning/20 text-warning-foreground',
                  tag.color === 'info' && 'bg-info/20 text-info',
                  tag.color === 'secondary' && 'bg-secondary text-secondary-foreground',
                  tag.color === 'accent' && 'bg-accent text-accent-foreground'
                )}
              >
                {tag.label}
              </Badge>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {property.visitDate}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            {completedItems}/{totalItems}
          </div>
          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
