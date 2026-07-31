import { useState } from 'react';
import { useMessages, type Message } from '@/hooks/usePortfolioData';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare, Mail, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { PageShell, EmptyState, PageLoader } from '@/components/PageShell';

export default function MessagesPage() {
  const { messages, isLoading, markAsRead, deleteMessage, unreadCount } = useMessages();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleOpenMessage = async (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read) await markAsRead.mutateAsync(message.id);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this message?')) {
      await deleteMessage.mutateAsync(id);
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <PageShell
      title="Messages"
      description={unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'Contact form submissions from your portfolio.'}
      maxWidth="xl"
    >
      {messages.length === 0 ? (
        <div className="bento-card">
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            body="When visitors contact you through your portfolio's contact form, their messages will appear here."
          />
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => handleOpenMessage(message)}
              className={cn(
                'group flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-150',
                !message.is_read
                  ? 'border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/8'
                  : 'border-border bg-card hover:bg-muted/40'
              )}
            >
              {/* Unread dot */}
              <div className="mt-1 shrink-0">
                {!message.is_read ? (
                  <div className="h-2 w-2 rounded-full bg-violet-500" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-transparent" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className={cn('text-sm font-semibold truncate', !message.is_read ? 'text-foreground' : 'text-foreground/80')}>
                    {message.sender_name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{message.sender_email}</span>
                </div>
                <p className={cn('text-sm line-clamp-2 leading-relaxed', !message.is_read ? 'text-foreground' : 'text-muted-foreground')}>
                  {message.content}
                </p>
              </div>

              {/* Delete */}
              <button
                onClick={(e) => handleDelete(message.id, e)}
                className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message detail dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        {selectedMessage && (
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Message from {selectedMessage.sender_name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-sm">
                <a href={`mailto:${selectedMessage.sender_email}`} className="text-violet-500 hover:underline font-medium">
                  {selectedMessage.sender_email}
                </a>
                <span className="text-muted-foreground/40">·</span>
                <span>{formatDistanceToNow(new Date(selectedMessage.created_at), { addSuffix: true })}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 border-t border-border/60 mt-1">
              {selectedMessage.content}
            </div>
            <DialogFooter className="gap-2 mt-2">
              <Button variant="outline" className="rounded-lg h-9 text-sm" asChild>
                <a href={`mailto:${selectedMessage.sender_email}?subject=Re: Portfolio Contact`}>
                  <Mail className="h-3.5 w-3.5 mr-1.5" />Reply
                </a>
              </Button>
              <Button variant="destructive" className="rounded-lg h-9 text-sm" onClick={() => handleDelete(selectedMessage.id)}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </PageShell>
  );
}
