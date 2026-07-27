import React, { useState } from 'react';
import { useGetNotifications, useCreateNotification, useGetAdminUsers } from '@workspace/api-client-react';
import { Bell, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function Notifications() {
  const { data: notifications = [], isLoading } = useGetNotifications();
  const createNotification = useCreateNotification();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [targetMode, setTargetMode] = useState('all');
  const [targetPhone, setTargetPhone] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    message: ''
  });

  // Small search for user by phone just to get ID
  const { data: searchData } = useGetAdminUsers({ search: targetPhone, limit: 1 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetUserId = null;
    if (targetMode === 'specific') {
      if (!searchData?.users?.[0]) {
        toast({ title: 'User not found with that phone number', variant: 'destructive' });
        return;
      }
      targetUserId = searchData.users[0].id;
    }

    createNotification.mutate({
      data: {
        title: formData.title,
        message: formData.message,
        targetUserId
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        toast({ title: 'Notification sent successfully' });
        setFormData({ title: '', message: '' });
        setTargetPhone('');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Push Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">Broadcast announcements or send targeted alerts to players.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Send className="w-4 h-4 mr-2 text-primary" /> Send Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-3">
                  <Label className="font-semibold">Target Audience</Label>
                  <RadioGroup value={targetMode} onValueChange={setTargetMode} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="cursor-pointer">All Users</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="specific" id="specific" />
                      <Label htmlFor="specific" className="cursor-pointer">Specific User</Label>
                    </div>
                  </RadioGroup>
                </div>

                {targetMode === 'specific' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-xs">User Phone Number</Label>
                    <Input 
                      placeholder="Enter 10-digit number" 
                      value={targetPhone}
                      onChange={(e) => setTargetPhone(e.target.value)}
                      className="font-mono"
                    />
                    {targetPhone.length >= 10 && searchData?.users?.[0] && (
                      <p className="text-xs text-green-600 font-medium flex items-center">
                        ✓ Found: {searchData.users[0].name}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    placeholder="e.g. Market Update, Big Win!" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea 
                    placeholder="Enter the notification content..." 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    className="min-h-[100px]"
                  />
                </div>
                
                <Button type="submit" className="w-full font-bold" disabled={createNotification.isPending}>
                  {createNotification.isPending ? 'Sending...' : 'Broadcast Notification'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-7">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Bell className="w-4 h-4 mr-2" /> Recent Broadcasts
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading history...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                  No notifications sent yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 rounded-xl border bg-card hover:bg-muted/10 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-sm">{notif.title}</h4>
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{notif.message}</p>
                      <div className="mt-3 flex items-center text-xs font-medium text-primary bg-primary/5 w-fit px-2 py-1 rounded">
                        <Users className="w-3 h-3 mr-1.5" />
                        {notif.targetUserId ? 'Direct Message' : 'Global Broadcast'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
