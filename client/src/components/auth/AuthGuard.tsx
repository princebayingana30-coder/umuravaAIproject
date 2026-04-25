'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { restoreSession } from '@/store/slices/authSlice';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Try to restore session from localStorage
      await dispatch(restoreSession());
      setIsInitialized(true);
    };
    initializeAuth();
  }, [dispatch]);

  useEffect(() => {
    if (!isInitialized) return;

    const isPublicPage = pathname === '/login' || pathname === '/';

    if (!token && !isPublicPage) {
      // Not logged in and not on a public page -> redirect to login
      router.push('/login');
    } else if (token && pathname === '/login') {
      // Logged in and on login page -> redirect to dashboard
      router.push('/dashboard');
    }
  }, [token, pathname, router, isInitialized]);

  // Show loading state while checking auth
  if (!isInitialized || (loading && !token)) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xl flex flex-col items-center justify-center z-[100]">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/20 mb-8 animate-pulse">
          <Loader2 className="text-white animate-spin" size={40} />
        </div>
        <div className="text-white text-xl font-bold tracking-tight animate-pulse">
          Authenticating with <span className="text-accent-blue">TalentIQ AI</span>...
        </div>
      </div>
    );
  }

  // If not logged in and not on a public page, we're about to redirect, so show nothing
  const isPublicPage = pathname === '/login' || pathname === '/';
  if (!token && !isPublicPage) {
    return null;
  }

  return <>{children}</>;
}
