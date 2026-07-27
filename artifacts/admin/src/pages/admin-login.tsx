import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAdminLogin } from '@workspace/api-client-react';
import { useAdminAuth } from '../contexts/admin-auth-context';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login } = useAdminAuth();
  const adminLoginMutation = useAdminLogin();
  
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    adminLoginMutation.mutate(
      { data: { username, password } },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          setLocation('/dashboard');
        },
        onError: () => {
          setError('Invalid credentials or unauthorized access');
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-2xl overflow-hidden border border-border">
        <div className="p-8 text-center bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
          <div className="w-16 h-16 bg-sidebar-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/20">
            <ShieldCheck className="w-8 h-8 text-sidebar-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Sara777 Control</h1>
          <p className="text-sidebar-foreground/60 text-sm mt-1">Authorized personnel only</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md flex items-center text-sm font-medium mb-6">
              <ShieldAlert className="w-5 h-5 mr-2 shrink-0" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold">Admin Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Passphrase</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold"
              disabled={adminLoginMutation.isPending}
            >
              {adminLoginMutation.isPending ? 'Authenticating...' : 'Access Command Center'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
