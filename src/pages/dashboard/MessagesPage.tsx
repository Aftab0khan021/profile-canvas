import { useState } from 'react';
import { useMessages, type Message } from '@/hooks/usePortfolioData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const { messages, isLoading, markAsRead, deleteMessage, unreadCount } = useMessages();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleOpenMessage = async (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      await markAsRead.mutateAsync(message.id);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this message?')) {
      await deleteMessage.mutateAsync(id);
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Contact form submissions {unreadCount > 0 && <Badge className="ml-2">{unreadCount} unread</Badge>}
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground text-center">
              When visitors contact you through your portfolio, their messages will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50",
                !message.is_read && "border-primary/50 bg-primary/5"
              )}
              onClick={() => handleOpenMessage(message)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!message.is_read ? (
                        <EyeOff className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={cn("font-semibold truncate", !message.is_read && "text-primary")}>
                        {message.sender_name}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{message.sender_email}</span>
                    </div>
                    <p className={cn("text-sm line-clamp-2", !message.is_read ? "text-foreground" : "text-muted-foreground")}>
                      {message.content}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={(e) => handleDelete(message.id, e)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        {selectedMessage && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Message from {selectedMessage.sender_name}</DialogTitle>
              <DialogDescription>
                <a href={`mailto:${selectedMessage.sender_email}`} className="text-primary hover:underline">
                  {selectedMessage.sender_email}
                </a>
                <span className="mx-2">•</span>
                <span>{formatDistanceToNow(new Date(selectedMessage.created_at), { addSuffix: true })}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" asChild>
                <a href={`mailto:${selectedMessage.sender_email}?subject=Re: Portfolio Contact`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Reply
                </a>
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(selectedMessage.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
