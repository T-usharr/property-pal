import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperties } from '@/contexts/PropertiesContext';
import { ChecklistCategory } from '@/components/ChecklistCategory';
import { TagSelector } from '@/components/TagSelector';
import { ReportGenerator } from '@/components/ReportGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  Building2,
  Trash2,
  Copy,
  Save,
  StickyNote,
  ClipboardList,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProperty, updateProperty, deleteProperty, duplicateProperty, isLoading } = useProperties();
  const [activeTab, setActiveTab] = useState<'checklist' | 'notes' | 'tags'>('checklist');

  const property = getProperty(id || '');

  useEffect(() => {
    // Only redirect after loading is complete and property still not found
    if (!isLoading && !property && id) {
      navigate('/');
    }
  }, [property, id, navigate, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  const handleChecklistUpdate = (
    categoryId: string,
    itemId: string,
    value: string | boolean | number | null,
    note?: string
  ) => {
    const updatedChecklist = property.checklist.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map((item) => {
            if (item.id === itemId) {
              return { ...item, value, ...(note !== undefined && { note }) };
            }
            return item;
          }),
        };
      }
      return cat;
    });
    updateProperty(property.id, { checklist: updatedChecklist });
  };

  const handleTagToggle = (tagId: string) => {
    const newTags = property.tags.includes(tagId)
      ? property.tags.filter((t) => t !== tagId)
      : [...property.tags, tagId];
    updateProperty(property.id, { tags: newTags });
  };

  const handleRatingChange = (rating: number) => {
    updateProperty(property.id, { rating });
  };

  const handleDelete = () => {
    deleteProperty(property.id);
    toast.success('Property deleted');
    navigate('/');
  };

  const handleDuplicate = async () => {
    const newId = await duplicateProperty(property.id);
    if (newId) {
      toast.success('Property duplicated');
      navigate(`/property/${newId}`);
    }
  };

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

  const tabs = [
    { id: 'checklist', label: 'Checklist', icon: ClipboardList },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'tags', label: 'Tags', icon: Tag },
  ] as const;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground p-4 pb-6 sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <Input
              value={property.name}
              onChange={(e) => updateProperty(property.id, { name: e.target.value })}
              className="bg-transparent border-none text-lg font-display font-bold text-primary-foreground p-0 h-auto focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-primary-foreground/70">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[120px]">{property.address || 'No address'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{property.visitDate}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-primary-foreground/70">Rating:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingChange(star)}
                className="p-0.5 hover:scale-110 transition-transform"
              >
                <Star
                  className={cn(
                    'w-6 h-6',
                    star <= property.rating
                      ? 'fill-warning text-warning'
                      : 'text-primary-foreground/30'
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-primary-foreground/70">Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="sticky top-[180px] z-10 bg-background border-b border-border px-4">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="px-4 pt-4">
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            {property.checklist.map((category) => (
              <ChecklistCategory
                key={category.id}
                category={category}
                onUpdate={handleChecklistUpdate}
              />
            ))}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-4">
              <Label className="text-sm font-medium mb-2 block">Property Address</Label>
              <Input
                value={property.address}
                onChange={(e) => updateProperty(property.id, { address: e.target.value })}
                placeholder="Enter full address..."
                className="mb-4"
              />

              <Label className="text-sm font-medium mb-2 block">Builder Name</Label>
              <Input
                value={property.builderName}
                onChange={(e) => updateProperty(property.id, { builderName: e.target.value })}
                placeholder="Enter builder/developer name..."
                className="mb-4"
              />

              <Label className="text-sm font-medium mb-2 block">Visit Date</Label>
              <Input
                type="date"
                value={property.visitDate}
                onChange={(e) => updateProperty(property.id, { visitDate: e.target.value })}
              />
            </Card>

            <Card className="p-4">
              <Label className="text-sm font-medium mb-2 block">
                <StickyNote className="w-4 h-4 inline mr-2" />
                Custom Notes & Observations
              </Label>
              <Textarea
                value={property.notes}
                onChange={(e) => updateProperty(property.id, { notes: e.target.value })}
                placeholder="Add your personal observations, concerns, questions, or anything else you want to remember about this property..."
                className="min-h-[200px]"
              />
            </Card>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-4">
              <Label className="text-sm font-medium mb-4 block">
                <Tag className="w-4 h-4 inline mr-2" />
                Property Tags
              </Label>
              <TagSelector selectedTags={property.tags} onToggle={handleTagToggle} />
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex gap-3">
        <ReportGenerator property={property} />
        
        <Button
          variant="outline"
          onClick={handleDuplicate}
          className="gap-2"
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Property?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{property.name}" and all its checklist data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default PropertyDetail;
