'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Calendar, User, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setActiveTab } from '../store/slices/navigationSlice';
import { checkAuthStatus, fetchUserProfile } from '../store/slices/authSlice';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAppSelector((state) => state.auth);
  const { activeTab } = useAppSelector((state) => state.navigation);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleTabChange = (tab: 'home' | 'plans' | 'schedule' | 'profile') => {
    dispatch(setActiveTab(tab));
    router.push(`/${tab === 'home' ? '' : tab}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="pb-20">
        {children}
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-50">
        <div className="flex justify-around items-center">
          <button
            onClick={() => handleTabChange('home')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'home' ? 'text-purple-600' : 'text-gray-400'
            }`}
          >
            <Home className={`h-6 w-6 ${activeTab === 'home' ? 'text-purple-600' : 'text-gray-400'}`} />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => handleTabChange('plans')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'plans' ? 'text-purple-600' : 'text-gray-400'
            }`}
          >
            <Calendar className={`h-6 w-6 ${activeTab === 'plans' ? 'text-purple-600' : 'text-gray-400'}`} />
            <span className="text-xs font-medium">Plans</span>
          </button>

          <button
            onClick={() => handleTabChange('schedule')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'schedule' ? 'text-purple-600' : 'text-gray-400'
            }`}
          >
            <Clock className={`h-6 w-6 ${activeTab === 'schedule' ? 'text-purple-600' : 'text-gray-400'}`} />
            <span className="text-xs font-medium">Schedule</span>
          </button>

          <button
            onClick={() => handleTabChange('profile')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'profile' ? 'text-purple-600' : 'text-gray-400'
            }`}
          >
            <User className={`h-6 w-6 ${activeTab === 'profile' ? 'text-purple-600' : 'text-gray-400'}`} />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
