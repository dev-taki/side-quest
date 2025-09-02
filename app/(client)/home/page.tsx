'use client';

import { useEffect } from 'react';
import { Plus, Calendar, CreditCard, Users, Home, Gift, User, Clock } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { useRouter } from 'next/navigation';
import { fetchUserSubscriptions } from '../../store/slices/subscriptionSlice';
import { AuthService } from '../../services/authService';

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { userSubscriptions, loading: subscriptionsLoading } = useAppSelector((state) => state.subscription);

  const BUSINESS_ID = 'a16c462c-e0e8-45f9-81d4-a344874fc46c';

  useEffect(() => {
    // Check authentication first
    const token = AuthService.getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    dispatch(fetchUserSubscriptions(BUSINESS_ID));
  }, [dispatch, router]);



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-6 pb-24">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#8c52ff] to-indigo-600 rounded-2xl p-6 text-white mb-6">
          <h1 className="text-2xl font-bold mb-2">Welcome Back, {user?.name || 'Adventurer'}!</h1>
          <p className="text-purple-100">Ready to continue your adventure?</p>
        </div>

        {/* Active Subscriptions */}
        {userSubscriptions && userSubscriptions.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Active Subscriptions</h2>
            <div className="space-y-4">
              {userSubscriptions
                .filter(sub => sub.status === 'ACTIVE')
                .map((subscription) => (
                  <div key={subscription.id} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-green-800">Active Subscription</h3>
                          <p className="text-sm text-green-600">Started {new Date(subscription.start_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600 font-medium">
                        ACTIVE
                      </span>
                    </div>
                    
                    {/* Credits Display */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Subscriber Credits</span>
                        </div>
                        <div className="text-xl font-bold text-green-600 mt-1">{subscription.available_credit}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Guest Credits</span>
                        </div>
                        <div className="text-xl font-bold text-green-600 mt-1">{subscription.gift_credit}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => router.push('/redeem')}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow w-full text-left"
          >
            <div className="w-12 h-12 bg-[#8c52ff] rounded-lg flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">New Quest</h3>
            <p className="text-sm text-gray-600">Start a new adventure</p>
          </button>
          
          <button 
            onClick={() => router.push('/plans')}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow w-full text-left"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Available Plans</h3>
            <p className="text-sm text-gray-600">View subscription plans</p>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-[#8c52ff] mb-1">
              {userSubscriptions ? userSubscriptions.reduce((total, sub) => total + sub.available_credit + sub.gift_credit, 0) : 0}
            </div>
            <div className="text-xs text-gray-600">Total Credits</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {userSubscriptions ? userSubscriptions.reduce((total, sub) => total + sub.available_credit, 0) : 0}
            </div>
            <div className="text-xs text-gray-600">Subscriber Credits</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {userSubscriptions ? userSubscriptions.reduce((total, sub) => total + sub.gift_credit, 0) : 0}
            </div>
            <div className="text-xs text-gray-600">Guest Credits</div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-50">
        <div className="flex justify-around items-center">
          <button
            onClick={() => router.push('/home')}
            className="flex flex-col items-center space-y-1 text-[#8c52ff]"
          >
            <Home className="h-6 w-6 text-[#8c52ff]" />
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
            className="flex flex-col items-center space-y-1 text-gray-400"
          >
            <User className="h-6 w-6 text-gray-400" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
