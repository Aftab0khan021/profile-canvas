import { useState } from 'react';
import { useProfileItems, ProfileItem } from '@/hooks/useProfileItems';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconPicker, DynamicIcon } from '@/components/IconPicker';
import { Plus, Pencil, Trash2, Loader2, Sparkles, Heart } from 'lucide-react';

type ItemType = 'highlight' | 'value';

interface ItemFormData {
  title: string;
  description: string;
  icon_name: string;
}

export default function BrandPage() {
  const { highlights, values, isLoading, createItem, updateItem, deleteItem } = useProfileItems();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProfileItem | null>(null);
  const [itemType, setItemType] = useState<ItemType>('highlight');
  const [formData, setFormData] = useState<ItemFormData>({ title: '', description: '', icon_name: '' });

  const openCreateDialog = (type: ItemType) => {
    setItemType(type);
    setEditingItem(null);
    setFormData({ title: '', description: '', icon_name: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (item: ProfileItem) => {
    setItemType(item.type);
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      icon_name: item.icon_name || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingItem) {
      await updateItem.mutateAsync({
        id: editingItem.id,
        title: formData.title,
        description: formData.description || null,
        icon_name: formData.icon_name || null,
      });
    } else {
      const maxSortOrder = Math.max(
        0,
        ...(itemType === 'highlight' ? highlights : values).map(i => i.sort_order)
      );
      await createItem.mutateAsync({
        type: itemType,
        title: formData.title,
        description: formData.description || null,
        icon_name: formData.icon_name || null,
        sort_order: maxSortOrder + 1,
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const renderItemCard = (item: ProfileItem) => (
    <Card key={item.id} className="group">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <DynamicIcon name={item.icon_name} className="h-6 w-6 text-primary" fallback={<Sparkles className="h-6 w-6 text-primary" />} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Brand & Identity</h1>
        <p className="text-muted-foreground">Customize the highlights and values displayed on your portfolio</p>
      </div>

      {/* Highlights Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                My Highlights
              </CardTitle>
              <CardDescription>
                "What Defines Me" cards shown on your About page
              </CardDescription>
            </div>
            <Button onClick={() => openCreateDialog('highlight')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Highlight
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {highlights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No highlights yet. Add what defines you!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {highlights.map(renderItemCard)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Values Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                My Values
              </CardTitle>
              <CardDescription>
                Core values cards shown on your About page
              </CardDescription>
            </div>
            <Button onClick={() => openCreateDialog('value')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Value
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {values.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No values yet. Share what you stand for!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {values.map(renderItemCard)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Add'} {itemType === 'highlight' ? 'Highlight' : 'Value'}
            </DialogTitle>
            <DialogDescription>
              {itemType === 'highlight'
                ? 'Add a quality that defines you as a professional'
                : 'Add a core value that guides your work'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <IconPicker
                value={formData.icon_name}
                onChange={(value) => setFormData(prev => ({ ...prev, icon_name: value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder={itemType === 'highlight' ? 'e.g., Problem Solver' : 'e.g., Quality First'}
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="A brief description..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || createItem.isPending || updateItem.isPending}
            >
              {(createItem.isPending || updateItem.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
