'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, setUser } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store';
import Link from 'next/link';
import { Loader2, Sparkles } from 'lucide-react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

/* ─── Social Login Components ─── */

function GoogleLoginButton({ onSuccess }: { onSuccess: (r: { credential?: string; access_token?: string }) => void }) {
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => onSuccess(codeResponse),
    onError: () => alert('Google login failed'),
    prompt: 'select_account'
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98]"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Sign in with Google
    </button>
  );
}


/* ─── Main Login Page ─── */

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, token } = useSelector((state: RootState) => state.auth);
  


  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);

  const handleDevGoogleLogin = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-dev`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('talentiq_token', data.token);
        dispatch(setUser({ token: data.token, user: data.user }));
        router.push('/dashboard');
      } else {
        const err = await response.json();
        alert(err.error || 'Google dev login failed');
      }
    } catch (err) {
      console.error('Dev Google login error:', err);
      alert('Failed to connect to server');
    }
  };



  const handleGoogleSuccess = async (credentialResponse: { credential?: string; access_token?: string }) => {
    try {
      const isAccessToken = !!credentialResponse.access_token;
      const tokenValue = credentialResponse.access_token || credentialResponse.credential;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenValue,
          tokenType: isAccessToken ? 'access_token' : 'id_token',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('talentiq_token', data.token);
        dispatch(setUser({ token: data.token, user: data.user }));
        router.push('/dashboard');
      } else {
        const err = await response.json();
        alert(err.error || 'Google login failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      alert('Failed to login with Google');
    }
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = googleClientId && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-3xl relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/10 blur-3xl rounded-full" />

        <div className="relative">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-600/30 mb-6">
              <Sparkles className="text-slate-900" size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2 tracking-tight">TalentIQ AI</h1>
            <p className="text-slate-500 font-medium max-w-[240px]">
              Access the merit-first recruitment engine.
            </p>
          </div>

          {/* Primary Social Logins */}
          <div className="space-y-4 mb-8">
            {isGoogleConfigured ? (
              <GoogleOAuthProvider clientId={googleClientId}>
                <GoogleLoginButton onSuccess={handleGoogleSuccess} />
              </GoogleOAuthProvider>
            ) : (
              <button
                type="button"
                onClick={handleDevGoogleLogin}
                className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] border border-slate-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </button>
            )}

          </div>




        </div>
      </div>
    </div>
  );
}
