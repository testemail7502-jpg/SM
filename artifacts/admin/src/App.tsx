import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { AdminAuthProvider, useAdminAuth } from './contexts/admin-auth-context';
import { AdminLayout } from './components/layout/admin-layout';
import { setAuthTokenGetter } from '@workspace/api-client-react';

import AdminLogin from './pages/admin-login';
import Dashboard from './pages/dashboard';
import Markets from './pages/markets';
import DeclareResult from './pages/declare-result';
import Results from './pages/results';
import Users from './pages/users';
import Deposits from './pages/deposits';
import Withdrawals from './pages/withdrawals';
import Rates from './pages/rates';
import Notifications from './pages/notifications';
import Chat from './pages/chat';
import Settings from './pages/settings';

const queryClient = new QueryClient();

// Setup API auth getter
setAuthTokenGetter(() => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('sara777_admin_token') || localStorage.getItem('sara777_token');
  }
  return null;
});

function ProtectedRoute({ component: Component }: { component: any }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  if (isLoading) return <div className="min-h-screen bg-sidebar flex items-center justify-center"><div className="animate-pulse w-12 h-12 rounded-full bg-sidebar-primary"></div></div>;
  if (!isAuthenticated) return <Redirect to="/admin-login" />;
  
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function Router() {
  const { isAuthenticated } = useAdminAuth();
  
  return (
    <Switch>
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/admin-login" />}
      </Route>
      <Route path="/admin-login" component={AdminLogin} />
      
      {/* Protected Routes */}
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/markets"><ProtectedRoute component={Markets} /></Route>
      <Route path="/declare-result"><ProtectedRoute component={DeclareResult} /></Route>
      <Route path="/results"><ProtectedRoute component={Results} /></Route>
      <Route path="/users"><ProtectedRoute component={Users} /></Route>
      <Route path="/deposits"><ProtectedRoute component={Deposits} /></Route>
      <Route path="/withdrawals"><ProtectedRoute component={Withdrawals} /></Route>
      <Route path="/rates"><ProtectedRoute component={Rates} /></Route>
      <Route path="/notifications"><ProtectedRoute component={Notifications} /></Route>
      <Route path="/chat"><ProtectedRoute component={Chat} /></Route>
      <Route path="/settings"><ProtectedRoute component={Settings} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
