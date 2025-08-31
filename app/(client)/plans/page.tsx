'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Star, Calendar, Gift, User, Home, Clock } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { PlansService, SubscriptionPlan, PlanVariation } from '../../services/plansService';
import { showToast } from '../../utils/toast';
import { AuthService } from '../../services/authService';
import SquarePaymentForm from '../../components/SquarePaymentForm';
import { fetchUserSubscriptions } from '../../store/slices/subscriptionSlice';

export default function PlansPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { userSubscriptions } = useAppSelector((state) => state.subscription);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [planVariations, setPlanVariations] = useState<PlanVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<PlanVariation | null>(null);

  const BUSINESS_ID = AuthService.getBusinessId();

  useEffect(() => {
    // Check authentication first
    const token = AuthService.getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    fetchPlans();
    dispatch(fetchUserSubscriptions(BUSINESS_ID));
  }, [dispatch, router]);

  // Refresh data when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        dispatch(fetchUserSubscriptions(BUSINESS_ID));
      }
    };

    const handleFocus = () => {
      dispatch(fetchUserSubscriptions(BUSINESS_ID));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [dispatch]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await PlansService.getPlans();
      setPlans(response.subscription_plans);
      setPlanVariations(response.plan_variations);
    } catch (error) {
      console.error('Error fetching plans:', error);
      showToast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const getPlanVariations = (planId: string): PlanVariation[] => {
    return planVariations.filter(v => v.plan_id === planId);
  };

  const hasActiveSubscription = () => {
    return userSubscriptions.some(sub => sub.status === 'ACTIVE');
  };

  const handleSubscribe = (variation: PlanVariation) => {
    if (hasActiveSubscription()) {
      showToast.error('You already have an active subscription. Please cancel your current subscription before subscribing to a new plan.');
      return;
    }
    setSelectedVariation(variation);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = async (cardId: string) => {
    setShowPaymentForm(false);
    setSelectedVariation(null);
    showToast.success('Subscription created successfully!');
    
    // Refresh subscription data immediately
    try {
      await dispatch(fetchUserSubscriptions(BUSINESS_ID));
    } catch (error) {
      console.error('Error refreshing subscriptions:', error);
    }
  };

  const handlePaymentError = (error: string) => {
    showToast.error(error);
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedVariation(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B3B3B]"></div>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
          <p className="text-gray-600">Select the perfect subscription plan for your adventure</p>
        </div>

        {/* Active Subscription Warning */}
        {hasActiveSubscription() && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Active Subscription Detected
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You already have an active subscription. Please cancel your current subscription before subscribing to a new plan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plans with Variations */}
        {plans.length > 0 && (
          <div className="space-y-8">
            {plans.map((plan) => (
              <div key={plan.object_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Plan Header */}
                <div className="bg-gradient-to-r from-[#8c52ff] to-[#7a47e6] p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                  <p className="text-gray-200 text-sm">
                    {getPlanVariations(plan.object_id).length} variation{getPlanVariations(plan.object_id).length !== 1 ? 's' : ''} available
                  </p>
                </div>

                {/* Plan Variations */}
                <div className="p-6 space-y-4">
                  {getPlanVariations(plan.object_id).map((variation, index) => (
                    <div
                      key={`${plan.object_id}-${variation.object_id}-${index}`}
                      className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {variation.name}
                        </h3>
                        
                        {/* Price and Billing Info */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Monthly Price:</span>
                            <span className="text-lg font-bold text-gray-900">${(variation.amount / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Billing Cycle:</span>
                            <span className="text-sm font-medium text-gray-700 capitalize">{variation.cadence.toLowerCase()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Credits per Month:</span>
                            <span className="text-sm font-medium text-green-600">{variation.credit} credits</span>
                          </div>
                        </div>


                      </div>

                      {variation.description && (
                        <div 
                          className="plan-description text-gray-600 mb-4"
                          dangerouslySetInnerHTML={{ __html: variation.description }}
                        />
                      )}

                      {/* Subscribe Button */}
                      <button
                        onClick={() => handleSubscribe(variation)}
                        disabled={hasActiveSubscription()}
                        className={`w-full py-3 px-6 rounded-xl font-medium flex items-center justify-center transition-colors ${
                          hasActiveSubscription()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#8c52ff] text-white hover:bg-[#7a47e6]'
                        }`}
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        {hasActiveSubscription() ? 'Already Subscribed' : 'Subscribe Now'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Plans Available */}
        {plans.length === 0 && !loading && (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Plans Available</h3>
            <p className="text-gray-600">Check back later for subscription plans</p>
          </div>
        )}
        </div>
      </div>

      {/* Payment Form Modal - Higher Priority */}
      {showPaymentForm && selectedVariation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Subscribe to {selectedVariation.name}
                </h3>
                <button
                  onClick={handlePaymentCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <div className="font-medium">Plan Details:</div>
                  <div>Price: ${(selectedVariation.amount / 100).toFixed(2)}/{selectedVariation.cadence.toLowerCase()}</div>
                  {selectedVariation.credit > 0 && (
                    <div>Credits: {selectedVariation.credit} per {selectedVariation.cadence.toLowerCase()}</div>
                  )}
                </div>
              </div>

              <SquarePaymentForm
                planVariationId={selectedVariation.object_id}
                amount={selectedVariation.amount || 0}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </div>
        </div>
      )}

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
            className="flex flex-col items-center space-y-1 text-[#8c52ff]"
          >
            <Calendar className="h-6 w-6 text-[#8c52ff]" />
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
