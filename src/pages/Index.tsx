import { useState } from 'react';
import { useProperties } from '@/contexts/PropertiesContext';
import { useAuth } from '@/hooks/useAuth';
import { PropertyCard } from '@/components/PropertyCard';
import { AddPropertyDialog } from '@/components/AddPropertyDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Search, Filter, FileText, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { defaultTags } from '@/data/defaultChecklist';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { properties, isLoading, addProperty } = useProperties();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const handleAddProperty = async (name: string, address: string, builderName: string) => {
    const id = await addProperty(name, address, builderName);
    if (id) {
      navigate(`/property/${id}`);
    } else {
      toast.error('Failed to add property');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.builderName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || p.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground p-6 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Building2 className="w-6 h-6" />
              </div>
              <h1 className="font-display text-2xl font-bold">FlatFinder</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-primary-foreground/70 text-sm">
            Evaluate properties with confidence
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 -mt-16 pb-8 relative z-10">
        {/* Add Property Button */}
        <div className="mb-6">
          <AddPropertyDialog onAdd={handleAddProperty} />
        </div>

        {/* Search and Filter */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search properties..."
              className="pl-10 h-12 bg-card shadow-card"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <button
              onClick={() => setFilterTag(null)}
              className="transition-transform active:scale-95"
            >
              <Badge
                variant={filterTag === null ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer whitespace-nowrap',
                  filterTag === null && 'gradient-primary text-primary-foreground border-0'
                )}
              >
                All
              </Badge>
            </button>
            {defaultTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
                className="transition-transform active:scale-95"
              >
                <Badge
                  variant={filterTag === tag.id ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer whitespace-nowrap',
                    filterTag === tag.id && 'gradient-primary text-primary-foreground border-0'
                  )}
                >
                  {tag.label}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              {properties.length === 0 ? 'No properties yet' : 'No matches found'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {properties.length === 0
                ? 'Add your first property to start evaluating'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'}
            </p>
            {filteredProperties.map((property, index) => (
              <div
                key={property.id}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
