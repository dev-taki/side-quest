'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Plus, Calendar, Clock, AlertCircle, User, Home } from 'lucide-react';

import { RedeemService, RedeemItem, AddRedeemData } from '../../services/redeemService';
import { AuthService } from '../../services/authService';
import { CardLoader, InlineLoader, ButtonLoader } from '../../components/common/Loader';
import { showToast } from '../../utils/toast';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchUserSubscriptions } from '../../store/slices/subscriptionSlice';

export default function RedeemPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userSubscriptions } = useAppSelector((state) => state.subscription);
  const { user } = useAppSelector((state) => state.auth);
  const BUSINESS_ID = AuthService.getBusinessId();
  
  const [loading, setLoading] = useState(true);
  const [redeemItems, setRedeemItems] = useState<RedeemItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [redeemType, setRedeemType] = useState<'normal' | 'guest' | null>(null);
  const [updatingCredits, setUpdatingCredits] = useState(false);

  const observer = useRef<IntersectionObserver | undefined>(undefined);
  const lastRedeemElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreRedeemItems();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    // Check authentication first
    const token = AuthService.getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    fetchRedeemItems();
    dispatch(fetchUserSubscriptions(BUSINESS_ID));
  }, [dispatch, router]);

  // Clear redeem type selection when credits become 0
  useEffect(() => {
    if (redeemType === 'normal' && !canRedeemNormal()) {
      setRedeemType(null);
    }
    if (redeemType === 'guest' && !canRedeemGuest()) {
      setRedeemType(null);
    }
  }, [userSubscriptions, redeemType]);

  const fetchRedeemItems = async () => {
    try {
      setLoading(true);
      const data = await RedeemService.getRedeemItems(0, 5);
      setRedeemItems(data);
      setPage(0);
      setHasMore(data.length === 5);
    } catch (error: any) {
      console.error('Error fetching redeem items:', error);
      showToast.error(error.message || 'Failed to load redeem items');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreRedeemItems = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await RedeemService.getRedeemItems(nextPage, 5);
      
      if (data.length > 0) {
        setRedeemItems(prev => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(data.length === 5);
      } else {
        setHasMore(false);
      }
    } catch (error: any) {
      console.error('Error loading more redeem items:', error);
      showToast.error(error.message || 'Failed to load more redeem items');
    } finally {
      setLoadingMore(false);
    }
  };

  const getTotalCredits = () => {
    return userSubscriptions.reduce((total, sub) => total + sub.available_credit, 0);
  };

  const getTotalGiftCredits = () => {
    return userSubscriptions.reduce((total, sub) => total + sub.gift_credit, 0);
  };

  const canRedeem = () => {
    return getTotalCredits() > 0 || getTotalGiftCredits() > 0;
  };

  const canRedeemNormal = () => {
    return getTotalCredits() > 0;
  };

  const canRedeemGuest = () => {
    return getTotalGiftCredits() > 0;
  };

  const handleAddRedeem = async () => {
    
    if (!redeemType) {
      showToast.error('Please select a redeem type');
      return;
    }

    // Check if the selected redeem type has available credits
    if (redeemType === 'normal' && !canRedeemNormal()) {
      showToast.error('You need available credits to create a normal redeem request');
      return;
    }

    if (redeemType === 'guest' && !canRedeemGuest()) {
      showToast.error('You need gift credits to create a guest redeem request');
      return;
    }

    if (!canRedeem()) {
      showToast.error('You need credits to create a redeem request');
      return;
    }
    
    setSubmitting(true);

    try {
      const redeemData: AddRedeemData = {
        business_id: BUSINESS_ID,
        button_number: redeemType === 'normal' ? 1 : 2
      };

      await RedeemService.addRedeem(redeemData);
      
      showToast.success('Redeem request created successfully!');
      
      // Reset form and refresh data
      setRedeemType(null);
      setShowAddForm(false);
      
      // Refresh both redeem items and subscription data to update credit balances
      setUpdatingCredits(true);
      await Promise.all([
        fetchRedeemItems(),
        dispatch(fetchUserSubscriptions(BUSINESS_ID))
      ]);
    } catch (error: any) {
      showToast.error(error.message || 'Failed to add redeem item');
    } finally {
      setSubmitting(false);
      setUpdatingCredits(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CardLoader text="Loading redeem items..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="pb-20">
        <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Redeem</h1>
          <p className="text-gray-600">Redeem your credits for rewards and services</p>
        </div>

        {/* Credit Balance Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-[#8c52ff] rounded-lg flex items-center justify-center">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Available Credits</h3>
                <p className="text-sm text-gray-600">Subscriber credits</p>
              </div>
            </div>
            <div className="text-center">
              {updatingCredits ? (
                <div className="text-2xl font-bold text-[#3B3B3B] animate-pulse">...</div>
              ) : (
                <div className={`text-2xl font-bold ${getTotalCredits() === 0 ? 'text-red-500' : 'text-[#3B3B3B]'}`}>
                  {getTotalCredits()}
                </div>
              )}
              <div className="text-xs text-gray-500">credits</div>
              {getTotalCredits() === 0 && (
                <div className="text-xs text-red-500 mt-1">No credits available</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gift Credits</h3>
                <p className="text-sm text-gray-600">Guest credits</p>
              </div>
            </div>
            <div className="text-center">
              {updatingCredits ? (
                <div className="text-2xl font-bold text-green-600 animate-pulse">...</div>
              ) : (
                <div className={`text-2xl font-bold ${getTotalGiftCredits() === 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {getTotalGiftCredits()}
                </div>
              )}
              <div className="text-xs text-gray-500">credits</div>
              {getTotalGiftCredits() === 0 && (
                <div className="text-xs text-red-500 mt-1">No gift credits available</div>
              )}
            </div>
          </div>
        </div>

        {/* Add Redeem Button */}
        <div className="flex justify-center">
          {canRedeem() ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-[#8c52ff] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#7a47e6] transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Redeem Request
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700 font-medium">No Credits Available</span>
              </div>
              <p className="text-sm text-red-600">You need credits to create redeem requests. Please check your subscription plans.</p>
              <div className="mt-3 text-xs text-red-500 space-y-1">
                {getTotalCredits() === 0 && (
                  <div>• No available credits from subscriptions</div>
                )}
                {getTotalGiftCredits() === 0 && (
                  <div>• No gift credits available</div>
                )}
              </div>
            </div>
          )}
        </div>



        {/* Redeem Items List */}
        <div className="space-y-4">
          {redeemItems.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
              <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Redeem Items</h3>
              <p className="text-gray-600">Start by creating your first redeem request.</p>
            </div>
          ) : (
            redeemItems.map((item, index) => (
              <div
                key={item.id}
                ref={index === redeemItems.length - 1 ? lastRedeemElementRef : null}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center space-x-3">
                    <Gift className="h-5 w-5 text-[#3B3B3B]" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Redeem Request #{item.id}
                    </h3>
                  </div>

                  {/* Order ID */}
                  <div className="text-sm">
                    <span className="text-gray-500">Order ID:</span>
                    <span className="ml-2 font-mono text-gray-700">{item.order_id}</span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>

                  {/* Credits */}
                  <div className="space-y-2">
                    {item.charged_credit > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Subscriber Credits: {item.charged_credit}</span>
                      </div>
                    )}
                    {item.gift_charge_credit > 0 && (
                      <div className="flex items-center text-sm text-green-600">
                        <Gift className="h-4 w-4 mr-2" />
                        <span>Gift Credits: {item.gift_charge_credit}</span>
                      </div>
                    )}
                  </div>

                  {/* Plan Variation */}
                  <div className="flex items-center text-sm text-gray-600">
                    <Gift className="h-4 w-4 mr-2" />
                    <span>{item.plan_variation_name}</span>
                  </div>
                </div>



              </div>
            ))
          )}

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <InlineLoader size="md" />
            </div>
          )}
        </div>

        {/* Add Redeem Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pb-12 z-50">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">New Redeem Request</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddRedeem(); }} className="p-6 space-y-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Redeem Request</h3>
                  <p className="text-gray-600">Select the type of redeem you want to create.</p>
                </div>

                {/* Redeem Type Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Redeem Type *
                  </label>
                  
                  {/* Warning message when no credits are available */}
                  {!canRedeem() && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-700 font-medium">No credits available</span>
                      </div>
                      <p className="text-xs text-red-600 mt-1">You need credits to create redeem requests. Please check your subscription plans.</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRedeemType('normal')}
                      disabled={!canRedeemNormal()}
                      className={`p-4 border-2 rounded-xl font-medium transition-colors ${
                        redeemType === 'normal'
                          ? 'border-[#8c52ff] bg-[#8c52ff] text-white'
                          : canRedeemNormal()
                            ? 'border-gray-300 text-gray-700 hover:border-gray-400'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold mb-1">Normal</div>
                        <div className="text-xs opacity-80">
                          {canRedeemNormal() ? 'Uses available credits' : 'No available credits'}
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRedeemType('guest')}
                      disabled={!canRedeemGuest()}
                      className={`p-4 border-2 rounded-xl font-medium transition-colors ${
                        redeemType === 'guest'
                          ? 'border-[#8c52ff] bg-[#8c52ff] text-white'
                          : canRedeemGuest()
                            ? 'border-gray-300 text-gray-700 hover:border-gray-400'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold mb-1">Guest</div>
                        <div className="text-xs opacity-80">
                          {canRedeemGuest() ? 'Uses gift credits' : 'No gift credits'}
                        </div>
                      </div>
                    </button>
                  </div>
                  
                  {/* Help text for redeem types */}
                  <div className="text-xs text-gray-500 space-y-1">
                    {!canRedeemNormal() && (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span>Normal redeem requires available credits from your subscription</span>
                      </div>
                    )}
                    {!canRedeemGuest() && (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span>Guest redeem requires gift credits</span>
                      </div>
                    )}
                  </div>
                </div>



                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !redeemType || (redeemType === 'normal' && !canRedeemNormal()) || (redeemType === 'guest' && !canRedeemGuest())}
                    className="flex-1 bg-[#8c52ff] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#7a47e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <ButtonLoader size="sm" />
                        Creating...
                      </>
                      ) : !redeemType || (redeemType === 'normal' && !canRedeemNormal()) || (redeemType === 'guest' && !canRedeemGuest()) ? (
                        <>
                          <AlertCircle className="h-5 w-5 mr-2" />
                          No Credits Available
                        </>
                      ) : (
                        <>
                          <Gift className="h-5 w-5 mr-2" />
                          Create Redeem
                        </>
                      )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
            className="flex flex-col items-center space-y-1 text-[#8c52ff]"
          >
            <Gift className="h-6 w-6 text-[#8c52ff]" />
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
