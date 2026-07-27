import { useGetNotifications } from '@workspace/api-client-react';
import { MobileShell } from '@/components/mobile-shell';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Bell } from 'lucide-react';
import { Link } from 'wouter';

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useGetNotifications({});

  return (
    <MobileShell showBottomNav={true}>
      <div className="min-h-[100dvh] bg-background pb-20">
        <div className="bg-gradient-to-br from-card via-card to-secondary p-5 border-b border-border sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Link href="/home" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notifications
            </h1>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto opacity-50" />
              <p className="text-sm">No new notifications.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <Card key={n.id} className="p-4 bg-card border-border shadow-sm space-y-1">
                <h3 className="font-bold text-sm text-foreground">{n.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-muted-foreground pt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </MobileShell>
  );
}
