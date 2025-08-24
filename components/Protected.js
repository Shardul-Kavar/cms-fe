'use client';

import React, { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Protected({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      const from = typeof window !== 'undefined' ? window.location.pathname : '/';
      router.replace(`/login?from=${encodeURIComponent(from)}`);
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
