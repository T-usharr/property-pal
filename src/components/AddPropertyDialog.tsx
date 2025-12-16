import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface AddPropertyDialogProps {
  onAdd: (name: string, address: string, builderName: string) => void;
}

export const AddPropertyDialog = ({ onAdd }: AddPropertyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [builderName, setBuilderName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), address.trim(), builderName.trim());
      setName('');
      setAddress('');
      setBuilderName('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 gradient-primary text-primary-foreground font-semibold h-12 shadow-glow hover:shadow-lg transition-all">
          <Plus className="w-5 h-5" />
          Add New Property
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add New Property</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Property/Project Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Prestige Lakeside Habitat"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Property Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., Whitefield, Bangalore"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="builder">Builder Name</Label>
            <Input
              id="builder"
              value={builderName}
              onChange={(e) => setBuilderName(e.target.value)}
              placeholder="e.g., Prestige Group"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 gradient-primary text-primary-foreground"
            >
              Add Property
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
