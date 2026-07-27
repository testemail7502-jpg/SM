import { ReactNode } from 'react';

interface MobileShellProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export function MobileShell({ children, showBottomNav = true }: MobileShellProps) {
  return (
    <div className="max-w-[430px] mx-auto min-h-[100dvh] bg-background relative">
      <div className={showBottomNav ? 'pb-16' : ''}>{children}</div>
    </div>
  );
}
