import { Link, useLocation } from 'wouter';
import { Home, Wallet, FileText, User } from 'lucide-react';

export function BottomNav() {
  const [location] = useLocation();
  
  const tabs = [
    { href: '/home', icon: Home, label: 'Home' },
    { href: '/wallet', icon: Wallet, label: 'Wallet' },
    { href: '/bids', icon: FileText, label: 'Bids' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-[430px] mx-auto grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.startsWith(tab.href);
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              data-testid={`nav-${tab.label.toLowerCase()}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
