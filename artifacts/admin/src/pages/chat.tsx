import React, { useState, useEffect, useRef } from 'react';
import { useGetAdminChatUsers, useGetChatMessages, useSendChatMessage } from '@workspace/api-client-react';
import { Search, Send, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

export default function Chat() {
  const { data: users = [], isLoading: usersLoading } = useGetAdminChatUsers();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const filteredUsers = users.filter(u => 
    u.userName.toLowerCase().includes(search.toLowerCase()) || 
    u.userPhone.includes(search)
  );

  const selectedUser = users.find(u => u.userId === selectedUserId);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row border rounded-xl overflow-hidden bg-card shadow-sm">
      {/* Users List Sidebar */}
      <div className={`w-full md:w-80 border-r flex flex-col bg-muted/10 ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b bg-card">
          <h2 className="font-bold text-lg mb-3">Support Chat</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search players..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {usersLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading contacts...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No conversations found.</div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map(user => (
                <button
                  key={user.userId}
                  onClick={() => setSelectedUserId(user.userId)}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-start gap-3 ${selectedUserId === user.userId ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="font-bold text-sm truncate">{user.userName}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{new Date(user.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.lastMessage}</p>
                  </div>
                  {user.unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                      {user.unreadCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-background ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
        {selectedUserId && selectedUser ? (
          <>
            <div className="p-4 border-b bg-card flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setSelectedUserId(null)}>
                ←
              </Button>
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">{selectedUser.userName}</h3>
                <p className="text-xs text-muted-foreground font-mono">{selectedUser.userPhone}</p>
              </div>
            </div>
            
            <ChatThread userId={selectedUserId} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Send className="w-8 h-8 opacity-20" />
            </div>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatThread({ userId }: { userId: string }) {
  const { data: messages = [] } = useGetChatMessages({ userId } as any);
  const sendMsg = useSendChatMessage();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [text, setText] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    sendMsg.mutate({ data: { message: text, targetUserId: userId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', { userId }] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/chat/users'] });
        setText('');
      }
    });
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.slice().reverse().map((msg) => {
          const isAdmin = msg.isAdmin;
          return (
            <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  isAdmin 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-muted text-foreground rounded-tl-sm border'
                }`}
              >
                {msg.message}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 px-1">
                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t bg-card">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            placeholder="Type a message..." 
            value={text}
            onChange={e => setText(e.target.value)}
            className="h-12 bg-background border-muted-foreground/20"
          />
          <Button type="submit" size="icon" className="h-12 w-12 shrink-0" disabled={!text.trim() || sendMsg.isPending}>
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </>
  );
}
