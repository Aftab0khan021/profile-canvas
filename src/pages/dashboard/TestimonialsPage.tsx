import { useState } from 'react';
import { useTestimonials, Testimonial } from '@/hooks/usePortfolioData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Star, Loader2, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function StarRating({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={cn(
              'h-6 w-6 transition-colors',
              star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const { testimonials, isLoading, createTestimonial, updateTestimonial, deleteTestimonial, bulkDeleteTestimonials } = useTestimonials();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    client_name: '',
    company: '',
    text: '',
    rating: 5,
  });

  const resetForm = () => {
    setFormData({ client_name: '', company: '', text: '', rating: 5 });
    setEditingTestimonial(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      company: formData.company || null,
    };
    if (editingTestimonial) {
      updateTestimonial.mutate({ id: editingTestimonial.id, ...data });
    } else {
      createTestimonial.mutate(data);
    }
    setIsOpen(false);
    resetForm();
  };

  const openEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      client_name: testimonial.client_name,
      company: testimonial.company || '',
      text: testimonial.text,
      rating: testimonial.rating,
    });
    setIsOpen(true);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === testimonials.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(testimonials.map((t) => t.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    bulkDeleteTestimonials.mutate(Array.from(selectedIds), {
      onSuccess: () => {
        setSelectedIds(new Set());
        toast({ title: `${selectedIds.size} testimonial(s) deleted` });
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground">Showcase feedback from your clients.</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteTestimonials.isPending}
            >
              {bulkDeleteTestimonials.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete ({selectedIds.size})
            </Button>
          )}
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Testimonial</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input
                    value={formData.client_name}
                    onChange={(e) => setFormData((p) => ({ ...p, client_name: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company (optional)</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                    placeholder="Acme Inc."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Testimonial Text *</Label>
                  <Textarea
                    value={formData.text}
                    onChange={(e) => setFormData((p) => ({ ...p, text: e.target.value }))}
                    placeholder="What did they say about working with you?"
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <StarRating
                    value={formData.rating}
                    onChange={(rating) => setFormData((p) => ({ ...p, rating }))}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createTestimonial.isPending || updateTestimonial.isPending}>
                  {(createTestimonial.isPending || updateTestimonial.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : testimonials.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            No testimonials yet. Add your first testimonial to showcase client feedback.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center gap-2 px-1">
            <Checkbox
              id="select-all"
              checked={selectedIds.size === testimonials.length && testimonials.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
              Select all ({testimonials.length})
            </Label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className={cn(selectedIds.has(testimonial.id) && 'ring-2 ring-primary')}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedIds.has(testimonial.id)}
                        onCheckedChange={() => toggleSelect(testimonial.id)}
                      />
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Quote className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{testimonial.client_name}</CardTitle>
                        {testimonial.company && (
                          <CardDescription>{testimonial.company}</CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(testimonial)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTestimonial.mutate(testimonial.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-4">"{testimonial.text}"</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-4 w-4',
                          star <= testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
