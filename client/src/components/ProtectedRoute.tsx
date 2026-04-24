'use client';

import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RootState } from '@/store';

const PUBLIC_ROUTES = ['/', '/login'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem('talentiq_token');
    
    if (token || storedToken || PUBLIC_ROUTES.includes(pathname)) {
      const timer = setTimeout(() => setIsChecking(false), 0);
      return () => clearTimeout(timer);
    } else {
      router.push('/login');
    }
  }, [pathname, router, token]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}