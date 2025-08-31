'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, CreditCard, Calendar, Gift, Home, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUserProfile, logout } from '../../store/slices/authSlice';
import { CardLoader } from '../../components/common/Loader';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { showToast } from '../../utils/toast';
import { AuthService } from '../../services/authService';

export default function ClientProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check authentication first
    const token = AuthService.getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    // Always fetch fresh profile data
    console.log('Fetching user profile...');
    dispatch(fetchUserProfile());
  }, [dispatch, router]);

  // Debug logging
  useEffect(() => {
    console.log('Profile page - user state:', user);
    console.log('Profile page - loading state:', loading);
    console.log('Profile page - error state:', error);
  }, [user, loading, error]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await dispatch(logout());
      showToast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      showToast.error('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <CardLoader text="Loading profile..." />;
  }

  if (!user) {
    return <CardLoader text="Loading profile..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorDisplay error={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-6 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-[#8c52ff] rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600 text-sm">Manage your account</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900 mt-1">{user.name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900 mt-1">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <p className="text-gray-900 mt-1 capitalize">{user.role || 'User'}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          
          <button
            onClick={() => router.push('/plans')}
            className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Subscription Plans</p>
                <p className="text-sm text-gray-600">View and manage your subscriptions</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/redeem')}
            className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Redeem Items</p>
                <p className="text-sm text-gray-600">Use your credits to redeem rewards</p>
              </div>
            </div>
          </button>
        </div>

        {/* Account Actions */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Account</h3>
          
          <button
            onClick={() => router.push('/settings')}
            className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg mr-4">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-600">Manage your preferences</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full bg-red-50 rounded-xl p-4 shadow-sm border border-red-200 hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-4">
                <LogOut className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-red-900">Logout</p>
                <p className="text-sm text-red-600">Sign out of your account</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-50">
        <div className="flex justify-around items-center">
          <button
            onClick={() => router.push('/home')}
            className="flex flex-col items-center space-y-1 text-gray-400"
          >
            <Home className="h-6 w-6 text-gray-400" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => router.push('/plans')}
            className="flex flex-col items-center space-y-1 text-gray-400"
          >
            <Calendar className="h-6 w-6 text-gray-400" />
            <span className="text-xs font-medium">Plans</span>
          </button>

          <button
            onClick={() => router.push('/schedule')}
            className="flex flex-col items-center space-y-1 text-gray-400"
          >
            <Clock className="h-6 w-6 text-gray-400" />
            <span className="text-xs font-medium">Schedule</span>
          </button>

          <button
            onClick={() => router.push('/redeem')}
            className="flex flex-col items-center space-y-1 text-gray-400"
          >
            <Gift className="h-6 w-6 text-gray-400" />
            <span className="text-xs font-medium">Redeem</span>
          </button>

          <button
            onClick={() => {
              // Check if user is admin and route accordingly
              const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'owner';
              const profilePath = isAdmin ? '/admin/profile' : '/profile';
              router.push(profilePath);
            }}
            className="flex flex-col items-center space-y-1 text-[#8c52ff]"
          >
            <User className="h-6 w-6 text-[#8c52ff]" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
