/**
 * Login.tsx
 * Full-screen login gate for SpellCoach.
 * Uses the same Firebase email/password accounts as FocusBuddy & Zaiden's Workshop.
 */

import React, { useState } from 'react';
import { BookOpen, LogIn, Loader } from 'lucide-react';
import { firebaseSignIn, firebaseSignInWithGoogle } from './firebase';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      await firebaseSignIn(email.trim().toLowerCase(), password);
      onLogin();
    } catch (err: any) {
      // Simplify Firebase error messages for a non-technical user
      const code = err?.code || '';
      if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
        setError('Email or password is incorrect. Try again.');
      } else if (code.includes('too-many-requests')) {
        setError('Too many attempts. Wait a moment and try again.');
      } else if (code.includes('network')) {
        setError('No internet connection. Check your connection and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await firebaseSignInWithGoogle();
      onLogin();
    } catch (err: any) {
      const code = err?.code || '';
      if (code.includes('popup-closed') || code.includes('cancelled')) {
        setError('Sign-in was cancelled. Try again.');
      } else {
        setError('Could not sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow — matches SpellCoach's dark purple aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#645188_0%,_#000000_80%)] opacity-90 mix-blend-screen pointer-events-none" />
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==")`
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo / header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#528881]/20 border border-[#528881]/40 mb-4 shadow-[0_0_24px_rgba(82,136,129,0.3)]">
            <BookOpen size={32} className="text-[#528881]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-100 tracking-wide mb-1">SpellCoach</h1>
          <p className="text-[#528881] text-xs tracking-widest uppercase">Sign in to sync your word lists</p>
        </div>

        {/* Login form */}
        <div className="bg-[#886451]/10 backdrop-blur-xl border border-[#528881]/30 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#528881] text-xs font-semibold uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="email"
                required
                className="w-full bg-black/50 border border-[#528881]/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#528881] focus:shadow-[0_0_8px_rgba(82,136,129,0.3)] transition-all min-h-[52px] text-base"
              />
            </div>

            <div>
              <label className="block text-[#528881] text-xs font-semibold uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full bg-black/50 border border-[#528881]/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#528881] focus:shadow-[0_0_8px_rgba(82,136,129,0.3)] transition-all min-h-[52px] text-base"
              />
            </div>

            {error && (
              <div className="bg-[#885159]/20 border border-[#885159]/50 rounded-xl px-4 py-3 text-[#ff9a9a] text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full flex items-center justify-center gap-2 bg-[#885159] hover:bg-[#885159]/90 text-white font-semibold py-3.5 rounded-xl border border-[#528881]/80 shadow-[0_0_10px_rgba(82,136,129,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] text-base mt-2"
            >
              {loading ? (
                <><Loader size={18} className="animate-spin" /> Signing in…</>
              ) : (
                <><LogIn size={18} /> Sign In</>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#528881]/30" />
            <span className="text-gray-500 text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-[#528881]/30" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] text-base"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Sign in with your Google account
        </p>
      </div>
    </div>
  );
}
