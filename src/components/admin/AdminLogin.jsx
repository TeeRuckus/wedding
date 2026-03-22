import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../layout/PageWrapper';
import Input from '../ui/Input';
import { PrimaryButton } from '../ui/Button';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError('Invalid email or password.');
        return;
      }

      navigate('/admin/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageWrapper centered>
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-5 flex items-center gap-2 text-stone-500 hover:text-wedding-black transition-colors z-20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs tracking-[0.15em] uppercase font-medium">Home</span>
      </button>

      <div className="bg-white/90 backdrop-blur-sm rounded-sm shadow-2xl p-10 border border-wedding-border
                      animate-fade-in w-full">
        <div className="text-center mb-8">
          <Lock className="w-8 h-8 text-stone-300 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-wedding-black tracking-wider">
            ADMIN PORTAL
          </h2>
          <p className="text-stone-400 text-xs tracking-wide mt-1">
            Event coordinator access
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            id="adminEmail"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="coordinator@email.com"
            autoComplete="email"
          />

          <Input
            id="adminPassword"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm text-red-500 text-center animate-fade-in">{error}</p>
          )}

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </PrimaryButton>
        </form>
      </div>
    </PageWrapper>
  );
}
