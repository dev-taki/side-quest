'use client';

import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthForm from '../components/AuthForm';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signup, clearError, checkAuthStatus } from '../store/slices/authSlice';
import { SignupData } from '../services/authService';

export default function SignupPage() {
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

  const handleSignup = async (data: { name?: string; email: string; password: string }) => {
    dispatch(clearError());
    
    if (!data.name) {
      return;
    }
    
    const signupData: SignupData = {
      name: data.name,
      email: data.email,
      password: data.password
    };
    
    const result = await dispatch(signup(signupData));
    
    if (signup.fulfilled.match(result)) {
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Side Quest</h2>
          <p className="text-gray-600 text-sm">Create your account to start your adventure</p>
        </div>

        <AuthForm
          mode="signup"
          onSubmit={handleSignup}
          loading={loading}
          error={error || undefined}
        />

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
