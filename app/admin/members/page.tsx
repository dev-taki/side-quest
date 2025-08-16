'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Edit, Users, Calendar, CreditCard, Loader2, X, Save, User, DollarSign } from 'lucide-react';
import { AdminAuthService } from '../../services/adminAuthService';
import AdminBottomNav from '../../components/AdminBottomNav';

const BUSINESS_ID = 'a16c462c-e0e8-45f9-81d4-a344874fc46c';

interface UserSubscription {
  id: number;
  created_at: number;
  user_id: number;
  status: string;
  square_subscription_id: string;
  square_source_name: string;
  square_card_id: string;
  square_location_id: string;
  square_plan_variation_id: string;
  start_date: number;
  subscriber_credit: number;
  guest_credit: number;
}

export default function MembersManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);
  const [createFormData, setCreateFormData] = useState({
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

        await loadSubscriptions();
      } catch (error) {
        AdminAuthService.removeAuthToken();
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const loadSubscriptions = async () => {
    try {
      const response = await fetch(
        `https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k/subscription/admin/user-subscription?business_id=${BUSINESS_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${AdminAuthService.getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load subscriptions');
      }

      const data = await response.json();
      setSubscriptions(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = () => {
    setCreateFormData({
      status: 'ACTIVE',
      start_date: new Date().toISOString().split('T')[0],
      subscriber_credit: 0,
      guest_credit: 0
    });
    setShowCreateForm(true);
    setError('');
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
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update subscription');
      }

      await loadSubscriptions();
      setShowEditForm(false);
      setSelectedSubscription(null);
    } catch (error: any) {
      setError(error.message || 'Failed to update subscription');
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
        {/* Add Subscription Button */}
        <div className="mb-6">
          <button
            onClick={handleCreateSubscription}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Subscription
          </button>
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
                    <h3 className="font-semibold text-gray-900">User ID: {subscription.user_id}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </div>
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

        {subscriptions.length === 0 && !loading && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No subscriptions found. Create your first subscription to get started.</p>
          </div>
        )}
      </main>

      {/* Create Subscription Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Subscription</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
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
                    Subscriber Credits
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createFormData.subscriber_credit}
                    onChange={(e) => setCreateFormData({...createFormData, subscriber_credit: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Credits
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createFormData.guest_credit}
                    onChange={(e) => setCreateFormData({...createFormData, guest_credit: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
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
                        Create Subscription
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
                    Subscriber Credits
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.subscriber_credit}
                    onChange={(e) => setEditFormData({...editFormData, subscriber_credit: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Credits
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.guest_credit}
                    onChange={(e) => setEditFormData({...editFormData, guest_credit: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
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
