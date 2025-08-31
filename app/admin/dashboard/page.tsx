'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Settings, BarChart3, Gift, DollarSign, User } from 'lucide-react';
import { AdminAuthService } from '../../services/adminAuthService';
import { AuthService } from '../../services/authService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllUserSubscriptions } from '../../store/slices/adminSlice';
import { fetchUserProfile } from '../../store/slices/authSlice';
import AdminBottomNav from '../../components/AdminBottomNav';
import PWAInstall from '../../components/PWAInstall';
import { CardLoader } from '../../components/common/Loader';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';

export default function AdminDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  
  // Redux state
  const { userSubscriptions, loading: subscriptionsLoading, error } = useAppSelector((state) => state.admin);
  const { user } = useAppSelector((state) => state.auth);

  const BUSINESS_ID = AuthService.getBusinessId();

  useEffect(() => {
    if (!AdminAuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!AdminAuthService.hasAdminRole()) {
      AdminAuthService.removeAuthToken();
      router.push('/login');
      return;
    }

    // Load subscription data via Redux
    dispatch(fetchAllUserSubscriptions());
    dispatch(fetchUserProfile());
    setLoading(false);
  }, [router, dispatch]);

  // Calculate subscription statistics from Redux state
  const subscriptionStats = {
    totalUsers: userSubscriptions.length,
    totalAmount: userSubscriptions.reduce((sum, subscription) => {
      return sum + (subscription.subscription_amount || 0);
    }, 0)
  };



  if (loading || subscriptionsLoading) {
    return <CardLoader text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <ErrorDisplay error={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <main className="p-4 pb-24">
        {/* Centered Title */}
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-4">
            <h1 className="text-3xl font-bold text-[#3B3B3B]">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600 text-sm">Vendor Management</p>
        </div>

        {/* Statistics */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Subscribers</p>
                  <p className="text-2xl font-bold text-[#3B3B3B]">{subscriptionStats.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(subscriptionStats.totalAmount / 100).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => router.push('/admin/users')}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-[#f5f5f5] rounded-lg mb-3">
                  <User className="h-6 w-6 text-[#3B3B3B]" />
                </div>
                <span className="text-sm font-medium text-gray-700">Users</span>
              </div>
            </button>

            <button 
              onClick={() => router.push('/admin/members')}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-[#f5f5f5] rounded-lg mb-3">
                  <Users className="h-6 w-6 text-[#3B3B3B]" />
                </div>
                <span className="text-sm font-medium text-gray-700">Manage Members</span>
              </div>
            </button>

            <button 
              onClick={() => router.push('/admin/redeem')}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-[#f5f5f5] rounded-lg mb-3">
                  <Gift className="h-6 w-6 text-[#3B3B3B]" />
                </div>
                <span className="text-sm font-medium text-gray-700">Redemption</span>
              </div>
            </button>

            <button 
              onClick={() => router.push('/plans')}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-[#f5f5f5] rounded-lg mb-3">
                  <BarChart3 className="h-6 w-6 text-[#3B3B3B]" />
                </div>
                <span className="text-sm font-medium text-gray-700">Client View</span>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <AdminBottomNav />
      <PWAInstall showAfterAuth={true} />
    </div>
  );
}
