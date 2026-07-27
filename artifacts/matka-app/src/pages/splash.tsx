import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { Sparkles, Trophy } from 'lucide-react';

export default function SplashPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        setLocation('/home');
      } else {
        setLocation('/login');
      }
    }, 1800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 space-y-6 animate-pulse">
        <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-amber-500 via-rose-600 to-amber-300 rounded-3xl p-0.5 shadow-2xl shadow-rose-600/30 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[23px] flex items-center justify-center">
            <Trophy className="w-12 h-12 text-amber-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-amber-200">
            SARA 777
          </h1>
          <p className="text-sm font-medium text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> India's Most Trusted Gaming Platform
          </p>
        </div>

        <div className="pt-8">
          <div className="w-10 h-10 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    </div>
  );
}
