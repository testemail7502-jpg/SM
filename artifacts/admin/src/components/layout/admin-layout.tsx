import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAdminAuth } from '../../contexts/admin-auth-context';
import { 
  LayoutDashboard, 
  Gamepad2, 
  Trophy, 
  History, 
  Users, 
  Wallet, 
  ArrowDownToLine, 
  Percent, 
  Bell, 
  MessageSquare, 
  Settings, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAdminAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/markets', label: 'Markets', icon: Gamepad2 },
    { href: '/declare-result', label: 'Declare Result', icon: Trophy },
    { href: '/results', label: 'Results', icon: History },
    { href: '/users', label: 'Users', icon: Users },
    { href: '/deposits', label: 'Deposits', icon: ArrowDownToLine },
    { href: '/withdrawals', label: 'Withdrawals', icon: Wallet },
    { href: '/rates', label: 'Rates', icon: Percent },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] w-full flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col hidden md:flex shrink-0 shadow-xl z-10 sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border/50 shrink-0">
          <ShieldCheck className="w-6 h-6 mr-3 text-sidebar-primary" />
          <h1 className="font-bold text-lg tracking-tight uppercase">Sara777 Admin</h1>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-sidebar-border/50 shrink-0">
          <div className="flex items-center px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold text-sm mr-3">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">Super Admin</p>
            </div>
          </div>
          <button 
            onClick={() => {
              logout();
            }}
            className="w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-destructive-foreground hover:bg-destructive transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="h-16 bg-card border-b flex items-center px-6 shrink-0 sticky top-0 z-10 md:hidden">
          <ShieldCheck className="w-6 h-6 mr-3 text-primary" />
          <h1 className="font-bold text-lg tracking-tight uppercase">Sara777 Admin</h1>
        </header>
        <div className="flex-1 p-6 lg:p-8 overflow-x-hidden max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
