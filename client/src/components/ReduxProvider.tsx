'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { restoreSession } from '@/store/slices/authSlice';

function SessionRestorer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(restoreSession());
  }, []);
  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionRestorer>{children}</SessionRestorer>
    </Provider>
  );
}