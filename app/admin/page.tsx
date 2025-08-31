'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoader } from '../components/common/Loader';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin login page
    router.push('/login');
  }, [router]);

  return <PageLoader text="Redirecting to admin login..." />;
}
