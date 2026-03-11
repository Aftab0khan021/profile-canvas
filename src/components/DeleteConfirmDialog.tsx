import { useState } from 'react';
import { Trash2, AlertTriangle, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Human-readable item label shown in the dialog, e.g. "React skill" or "Blog Post: My Article" */
  itemLabel: string;
  /** Called when user picks "Move to Trash" — sets deleted_at in DB */
  onSoftDelete: () => Promise<void>;
  /** Called when user picks "Delete Permanently" — hard-deletes from DB */
  onHardDelete: () => Promise<void>;
}

/**
 * Two-option delete dialog:
 * - "Move to Trash": soft-delete (deleted_at = now). Item is recoverable for 30 days.
 * - "Delete Permanently": instant hard delete. Cannot be undone.
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemLabel,
  onSoftDelete,
  onHardDelete,
}: DeleteConfirmDialogProps) {
  const [softLoading, setSoftLoading] = useState(false);
  const [hardLoading, setHardLoading] = useState(false);

  const handleSoftDelete = async () => {
    setSoftLoading(true);
    try {
      await onSoftDelete();
      onOpenChange(false);
    } finally {
      setSoftLoading(false);
    }
  };

  const handleHardDelete = async () => {
    setHardLoading(true);
    try {
      await onHardDelete();
      onOpenChange(false);
    } finally {
      setHardLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Item
          </DialogTitle>
          <DialogDescription className="pt-1">
            How would you like to delete{' '}
            <span className="font-medium text-foreground">"{itemLabel}"</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Soft Delete Option */}
          <div className="rounded-lg border p-4 space-y-2 hover:bg-muted/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">Move to Trash</span>
              </div>
              <Badge variant="secondary" className="text-xs">Recommended</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Item is hidden from your portfolio but safely stored for <strong>30 days</strong>.
              You can restore it anytime from the Trash section in your dashboard.
              It will be permanently purged after 30 days automatically.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
              onClick={handleSoftDelete}
              disabled={softLoading || hardLoading}
            >
              {softLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Move to Trash (Restorable for 30 days)
            </Button>
          </div>

          {/* Hard Delete Option */}
          <div className="rounded-lg border border-destructive/30 p-4 space-y-2 hover:bg-destructive/5 transition-colors">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-sm text-destructive">Delete Permanently</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This item will be <strong>immediately and permanently removed</strong> from the
              database. This action <strong>cannot be undone</strong>.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={handleHardDelete}
              disabled={softLoading || hardLoading}
            >
              {hardLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              Delete Permanently
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={softLoading || hardLoading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
