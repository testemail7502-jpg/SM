import { useState } from 'react';
import { useGetChatMessages, useSendChatMessage, useGetSettings } from '@workspace/api-client-react';
import { MobileShell } from '@/components/mobile-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MessageSquare, Send, MessageCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function ChatPage() {
  const { data: messages, isLoading, refetch } = useGetChatMessages();
  const { data: settings } = useGetSettings();
  const sendMutation = useSendChatMessage();
  const [text, setText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    sendMutation.mutate(
      { data: { message: text.trim() } },
      {
        onSuccess: () => {
          setText('');
          refetch();
        },
      }
    );
  };

  const whatsappNum = settings?.whatsappNumber || '+919876543210';
  const whatsappUrl = `https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Admin, I need support with my account.')}`;

  return (
    <MobileShell showBottomNav={true}>
      <div className="min-h-[100dvh] flex flex-col bg-background pb-16">
        {/* Header */}
        <div className="bg-gradient-to-br from-card via-card to-secondary p-4 border-b border-border sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/home" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Support & Chat
            </h1>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow transition-all"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp Support
          </a>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-3/4 ml-auto" />
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="text-center py-12 space-y-3 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto opacity-40" />
              <p className="text-sm font-medium">How can we help you today?</p>
              <p className="text-xs">Type a message below or contact us directly on WhatsApp.</p>
            </div>
          ) : (
            messages.map((m: any) => {
              const isUser = !m.isAdmin;
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <Card
                    className={`max-w-[80%] p-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-primary text-primary-foreground rounded-t-2xl rounded-bl-2xl rounded-br-xs'
                        : 'bg-card text-foreground border-border rounded-t-2xl rounded-br-2xl rounded-bl-xs'
                    }`}
                  >
                    <p>{m.message || m.text}</p>
                    <p
                      className={`text-[9px] mt-1 text-right ${
                        isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </Card>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-3 bg-card border-t border-border flex gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-input border-border text-foreground text-sm flex-1"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={sendMutation.isPending || !text.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </MobileShell>
  );
}
