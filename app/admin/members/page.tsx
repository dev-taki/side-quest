'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Edit, Users, Calendar, CreditCard, Loader2, X, Save, User, DollarSign } from 'lucide-react';
import { AdminAuthService } from '../../services/adminAuthService';
import AdminBottomNav from '../../components/AdminBottomNav';

const BUSINESS_ID = 'a16c462c-e0e8-45f9-81d4-a344874fc46c';

interface UserSubscription {
  id: number;
  email: string;
  status: string;
  user_id: number;
  created_at: number;
  start_date: number;
  guest_credit: number;
  square_card_id: string;
  subscriber_credit: number;
  square_location_id: string;
  square_source_name: string;
  square_subscription_id: string;
  square_plan_variation_id: string;
}

export default function MembersManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    password: '',
    status: 'ACTIVE',
    start_date: '',
    subscriber_credit: 0,
    guest_credit: 0
  });
  const [editFormData, setEditFormData] = useState({
    status: '',
    start_date: '',
    subscriber_credit: 0,
    guest_credit: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!AdminAuthService.isAuthenticated()) {
        router.push('/admin/login');
        return;
      }

      try {
        const isAdmin = await AdminAuthService.verifyAdminStatus();
        if (!isAdmin) {
          AdminAuthService.removeAuthToken();
          router.push('/admin/login');
          return;
        }

        await loadSubscriptions(0, '', false);
      } catch (error) {
        AdminAuthService.removeAuthToken();
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const loadSubscriptions = async (page = 0, email = '', append = false) => {
    try {
      let url = `https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k/subscription/admin/user-subscription?business_id=${BUSINESS_ID}`;
      
      // Add page_number only if not searching by email
      if (!email) {
        url += `&page_number=${page}`;
      }
      
      // Add email parameter if provided
      if (email) {
        url += `&email=${encodeURIComponent(email)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AdminAuthService.getAuthToken()}`,
          'Cookie': `side-quest=${AdminAuthService.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load subscriptions');
      }

      const data = await response.json();
      
      if (append) {
        setSubscriptions(prev => [...prev, ...data]);
      } else {
        setSubscriptions(data);
      }
      
      // Check if there are more results
      setHasMore(data.length === 5); // Assuming 5 items per page
    } catch (error: any) {
      setError(error.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleCreateUserAndSubscription = () => {
    setCreateFormData({
      name: '',
      email: '',
      password: '',
      status: 'ACTIVE',
      start_date: new Date().toISOString().split('T')[0],
      subscriber_credit: 0,
      guest_credit: 0
    });
    setShowCreateForm(true);
    setError('');
  };

  const handleSearch = async () => {
    setPageNumber(0);
    setHasMore(true);
    await loadSubscriptions(0, searchEmail, false);
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore || searchEmail) return;
    
    setIsLoadingMore(true);
    const nextPage = pageNumber + 1;
    setPageNumber(nextPage);
    await loadSubscriptions(nextPage, '', true);
  };

  const handleClearSearch = async () => {
    setSearchEmail('');
    setPageNumber(0);
    setHasMore(true);
    await loadSubscriptions(0, '', false);
  };

  const handleEditSubscription = (subscription: UserSubscription) => {
    setSelectedSubscription(subscription);
    setEditFormData({
      status: subscription.status,
      start_date: new Date(subscription.start_date).toISOString().split('T')[0],
      subscriber_credit: subscription.subscriber_credit,
      guest_credit: subscription.guest_credit
    });
    setShowEditForm(true);
    setError('');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const createData = {
        business_id: BUSINESS_ID,
        status: createFormData.status,
        start_date: new Date(createFormData.start_date).getTime(),
        subscriber_credit: createFormData.subscriber_credit,
        guest_credit: createFormData.guest_credit
      };

      const response = await fetch(
        'https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k/subscription/admin/create-sub-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AdminAuthService.getAuthToken()}`,
            'Cookie': `side-quest=${AdminAuthService.getAuthToken()}`,
          },
          body: JSON.stringify(createData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subscription');
      }

      await loadSubscriptions();
      setShowCreateForm(false);
    } catch (error: any) {
      setError(error.message || 'Failed to create subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUserAndSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // First, create the user using signup API
      const signupData = {
        business_id: BUSINESS_ID,
        name: createFormData.name,
        email: createFormData.email,
        password: createFormData.password
      };

      const response = await fetch(
        'https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k/auth/signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(signupData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'ERROR_CODE_ACCESS_DENIED') {
          throw new Error('This email is already registered. Please use a different email address.');
        }
        throw new Error(errorData.message || 'Failed to create user');
      }

      const userData = await response.json();
      console.log(userData);
      
      // Now create subscription using the user's authToken
      const subscriptionData = {
        business_id: BUSINESS_ID,
        email: createFormData.email,
        status: createFormData.status,
        start_date: new Date(createFormData.start_date).getTime(),
        subscriber_credit: createFormData.subscriber_credit,
        guest_credit: createFormData.guest_credit
      };

      const subscriptionResponse = await fetch(
        'https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k/subscription/admin/create-sub-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.authToken}`,
          },
          body: JSON.stringify(subscriptionData),
        }
      );

      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.json();
        if (errorData.code === 'ERROR_CODE_ACCESS_DENIED') {
          throw new Error('Failed to create subscription. Please try again.');
        }
        throw new Error(errorData.message || 'Failed to create subscription for user');
      }

      await loadSubscriptions(0, searchEmail, false);
      setShowCreateForm(false);
      alert('User and subscription created successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to create user and subscription');
      alert(error.message || 'Failed to create user and subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const updateData = {
        business_id: BUSINESS_ID,
        user_id: selectedSubscription!.user_id,
        status: editFormData.status,
        start_date: new Date(editFormData.start_date).getTime(),
        subscriber_credit: editFormData.subscriber_credit,
        guest_credit: editFormData.guest_credit
      };

      const response = await fetch(
        'https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k/subscription/admin/user-subscription',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AdminAuthService.getAuthToken()}`,
            'Cookie': `side-quest=${AdminAuthService.getAuthToken()}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update subscription');
      }

      await loadSubscriptions(0, searchEmail, false);
      setShowEditForm(false);
      setSelectedSubscription(null);
      alert('Subscription updated successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to update subscription');
      alert(error.message || 'Failed to update subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Manage Members</h1>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-24">
        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={handleCreateUserAndSubscription}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New User & Subscription
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by email..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            {searchEmail && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Subscriptions List */}
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">{subscription.email}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    User ID: {subscription.user_id}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Subscription ID: {subscription.square_subscription_id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Created: {formatDate(subscription.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleEditSubscription(subscription)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="h-5 w-5" />
                </button>
              </div>

              {/* Credits Section */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Subscriber Credits</p>
                      <p className="text-lg font-bold text-green-600">{subscription.subscriber_credit}</p>
                    </div>
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Guest Credits</p>
                      <p className="text-lg font-bold text-blue-600">{subscription.guest_credit}</p>
                    </div>
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Card ID: {subscription.square_card_id}</p>
                <p>Location ID: {subscription.square_location_id}</p>
                <p>Plan Variation ID: {subscription.square_plan_variation_id}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && !searchEmail && subscriptions.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}

        {subscriptions.length === 0 && !loading && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchEmail ? `No subscriptions found for email "${searchEmail}".` : 'No subscriptions found. Create your first subscription to get started.'}
            </p>
          </div>
        )}
      </main>

      {/* Create User & Subscription Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New User & Subscription</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateUserAndSubscriptionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({...createFormData, email: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({...createFormData, password: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter password"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> This will create a new user account and automatically create a subscription.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={createFormData.status}
                    onChange={(e) => setCreateFormData({...createFormData, status: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={createFormData.start_date}
                    onChange={(e) => setCreateFormData({...createFormData, start_date: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reduce Subscriber Credits
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createFormData.subscriber_credit}
                    onChange={(e) => setCreateFormData({...createFormData, subscriber_credit: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter amount to reduce from current credits</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reduce Guest Credits
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createFormData.guest_credit}
                    onChange={(e) => setCreateFormData({...createFormData, guest_credit: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter amount to reduce from current credits</p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Create User & Subscription
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subscription Form Modal */}
      {showEditForm && selectedSubscription && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Subscription</h2>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={selectedSubscription.user_id}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={editFormData.start_date}
                    onChange={(e) => setEditFormData({...editFormData, start_date: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reduce Subscriber Credits
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.subscriber_credit}
                    onChange={(e) => setEditFormData({...editFormData, subscriber_credit: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter amount to reduce from current credits</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reduce Guest Credits
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.guest_credit}
                    onChange={(e) => setEditFormData({...editFormData, guest_credit: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter amount to reduce from current credits</p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Update Subscription
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <AdminBottomNav />
    </div>
  );
}
