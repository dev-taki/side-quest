'use client';

import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthForm from './components/AuthForm';
import PWAInstall from './components/PWAInstall';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { login, clearError, checkAuthStatus } from './store/slices/authSlice';
import { LoginData } from './services/authService';

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (data: LoginData) => {
    dispatch(clearError());
    const result = await dispatch(login(data));
    
    if (login.fulfilled.match(result)) {
      router.push('/home');
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Side Quest</h2>
          <p className="text-gray-600 text-sm">Sign in to continue your adventure</p>
        </div>

        <AuthForm
          mode="login"
          onSubmit={handleLogin}
          loading={loading}
          error={error || undefined}
        />

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
      <PWAInstall showOnAuth={true} />
    </div>
  );
}
