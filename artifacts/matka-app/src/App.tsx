import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/contexts/auth-context';
import { setAuthTokenGetter } from '@workspace/api-client-react';

import SplashPage from '@/pages/splash';
import LoginPage from '@/pages/login';
import OtpPage from '@/pages/otp';
import RegisterPage from '@/pages/register';
import HomePage from '@/pages/home';
import GamePage from '@/pages/game';
import WalletPage from '@/pages/wallet';
import AddFundsPage from '@/pages/wallet-add-funds';
import WithdrawPage from '@/pages/wallet-withdraw';
import MyBidsPage from '@/pages/my-bids';
import ResultsHistoryPage from '@/pages/results-history';
import RateCardPage from '@/pages/rate-card';
import NotificationsPage from '@/pages/notifications';
import ChatPage from '@/pages/chat';
import ProfilePage from '@/pages/profile';

const queryClient = new QueryClient();

// Setup API auth getter
setAuthTokenGetter(() => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('sara777_token');
  }
  return null;
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={SplashPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/otp" component={OtpPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/home" component={HomePage} />
      <Route path="/game/:marketId" component={GamePage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/wallet/add-funds" component={AddFundsPage} />
      <Route path="/wallet/withdraw" component={WithdrawPage} />
      <Route path="/bids" component={MyBidsPage} />
      <Route path="/results" component={ResultsHistoryPage} />
      <Route path="/rates" component={RateCardPage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/profile" component={ProfilePage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
