'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useAppDispatch } from '../store/hooks';
import { signup, clearError } from '../store/slices/authSlice';
import { ButtonLoader } from '../components/common/Loader';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { SignupData } from '../types';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import { AuthService } from '../services/authService';

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, loading, error, user } = useAuth();
  
  const [formData, setFormData] = useState<SignupData>({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check for existing auth token on page load
    const token = AuthService.getAuthToken();
    const role = AuthService.getRole();
    
    if (token) {
          // Check if user has admin role and redirect accordingly
    const isAdmin = role === 'admin' || role === 'super_admin' || role === 'owner';
    
    if (isAdmin) {
      router.push('/admin/dashboard');
    } else {
      router.push('/home');
    }
      return;
    }

    // If authenticated through Redux state, redirect accordingly
    if (isAuthenticated && user) {
      const isAdmin = user.role === 'admin' || user.role === 'super_admin' || user.role === 'owner';
      
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/home');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(signup(formData));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isPasswordValid = formData.password.length >= 8;

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-8">
        {/* Title and subtitle */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900 mr-2">Create an account</h1>
            <div className="flex space-x-1">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
          <p className="text-gray-600">Welcome! Please enter your details.</p>
        </div>
        
        <ErrorDisplay error={error} onClear={handleClearError} className="mb-6" />
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Password validation */}
          <div className="flex items-center">
            <div className={`flex items-center h-4 w-4 rounded ${isPasswordValid ? 'bg-green-500' : 'bg-gray-300'} mr-2`}>
              {isPasswordValid && <Check className="h-3 w-3 text-white" />}
            </div>
            <span className="text-sm text-gray-600">Must be at least 8 characters</span>
          </div>

          {/* Sign up button */}
          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#8c52ff] hover:bg-[#7a47e6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8c52ff] disabled:opacity-50 disabled:cursor-not-allowed"
          >
                            {loading ? <ButtonLoader size="sm" /> : 'Sign Up'}
          </button>
        </form>



        {/* Log in link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
                              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
