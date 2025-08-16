'use client';

import { useEffect } from 'react';
import { Plus, Calendar, CreditCard, Users } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import AuthenticatedLayout from '../components/AuthenticatedLayout';
import { useRouter } from 'next/navigation';
import { fetchUserSubscriptions } from '../store/slices/subscriptionSlice';

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { stats } = useAppSelector((state: any) => state.user);
  const { userSubscriptions, loading: subscriptionsLoading } = useAppSelector((state) => state.subscription);

  const BUSINESS_ID = 'a16c462c-e0e8-45f9-81d4-a344874fc46c';

  useEffect(() => {
    dispatch(fetchUserSubscriptions(BUSINESS_ID));
  }, [dispatch]);

  return (
    <AuthenticatedLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome Back, {user?.name || 'Adventurer'}!</h1>
          <p className="text-purple-100">Ready to continue your adventure?</p>
        </div>

        {/* Active Subscriptions */}
        {userSubscriptions.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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
                        <div className="text-xl font-bold text-green-600 mt-1">{subscription.subscriber_credit}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Guest Credits</span>
                        </div>
                        <div className="text-xl font-bold text-green-600 mt-1">{subscription.guest_credit}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => router.push('/schedule')}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow w-full text-left"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-purple-600" />
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

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Completed Morning Quest</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Started New Plan</p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Joined Side Quest</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {userSubscriptions.reduce((total, sub) => total + sub.subscriber_credit + sub.guest_credit, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Credits</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {userSubscriptions.reduce((total, sub) => total + sub.subscriber_credit, 0)}
            </div>
            <div className="text-xs text-gray-600">Subscriber Credits</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {userSubscriptions.reduce((total, sub) => total + sub.guest_credit, 0)}
            </div>
            <div className="text-xs text-gray-600">Guest Credits</div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
