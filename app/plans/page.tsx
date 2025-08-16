'use client';

import { useEffect, useState } from 'react';
import { Calendar, DollarSign, Check, Star, Clock, Users } from 'lucide-react';
import AuthenticatedLayout from '../components/AuthenticatedLayout';
import { PlansService, SubscriptionPlan, PlanVariation, centsToDollars } from '../services/plansService';
import SquarePaymentForm from '../components/SquarePaymentForm';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserSubscriptions } from '../store/slices/subscriptionSlice';

const BUSINESS_ID = 'a16c462c-e0e8-45f9-81d4-a344874fc46c';

export default function PlansPage() {
  const dispatch = useAppDispatch();
  const { userSubscriptions, loading: subscriptionsLoading, error: subscriptionsError } = useAppSelector((state) => state.subscription);
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [variations, setVariations] = useState<PlanVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedVariationId, setSelectedVariationId] = useState<string>('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    loadPlans();
    dispatch(fetchUserSubscriptions(BUSINESS_ID));
  }, [dispatch]);

  const loadPlans = async () => {
    try {
      const [plansData, variationsData] = await Promise.all([
        PlansService.getSubscriptionPlans(BUSINESS_ID),
        PlansService.getPlanVariations(BUSINESS_ID)
      ]);
      
      setPlans(plansData);
      setVariations(variationsData);
    } catch (error: any) {
      setError(error.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const getVariationsForPlan = (planId: number) => {
    return variations.filter(v => v.plan_id === planId);
  };

  const getBillingFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'WEEKLY': return 'WEEKLY';
      case 'MONTHLY': return 'MONTHLY';
      case 'YEARLY': return 'YEARLY';
      default: return frequency;
    }
  };

  const handleSubscribe = (variationId: string) => {
    setSelectedVariationId(variationId);
    setShowPaymentForm(true);
    setPaymentError('');
    setPaymentSuccess(false);
  };

  const handlePaymentSuccess = (cardId: string) => {
    setPaymentSuccess(true);
    setShowPaymentForm(false);
    setPaymentError('');
    // You can add additional success handling here
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const closePaymentForm = () => {
    setShowPaymentForm(false);
    setPaymentError('');
    setPaymentSuccess(false);
  };

  const isUserSubscribedToVariation = (variationId: string) => {
    return userSubscriptions.some(sub => sub.square_plan_variation_id === variationId && sub.status === 'ACTIVE');
  };

  const getUserSubscription = (variationId: string) => {
    return userSubscriptions.find(sub => sub.square_plan_variation_id === variationId);
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="p-6 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="p-6 space-y-6">
        {/* Payment Success Message */}
        {paymentSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-600">Subscription created successfully! 🎉</p>
          </div>
        )}

        {/* Payment Error Message */}
        {paymentError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{paymentError}</p>
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Available Plans</h1>
          <p className="text-gray-600 text-sm">Choose the perfect plan for your needs</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Current Subscriptions */}
        {userSubscriptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Current Subscriptions</h2>
            <div className="space-y-4">
              {userSubscriptions
                .filter(sub => sub.status === 'ACTIVE')
                .map((subscription) => {
                  const variation = variations.find(v => v.square_variation_id === subscription.square_plan_variation_id);
                  const plan = plans.find(p => p.id === variation?.plan_id);
                  
                  return (
                    <div key={subscription.id} className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-green-800">
                            {plan?.plan_display_name} - {variation?.variation_display_name}
                          </h3>
                          <p className="text-sm text-green-600">Active Subscription</p>
                        </div>
                        <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
                          ACTIVE
                        </span>
                      </div>
                      <div className="text-sm text-green-700">
                        <p>Started: {new Date(subscription.start_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Available Plans */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Plans</h2>
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Plan Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900">{plan.plan_display_name}</h2>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    plan.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {plan.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{plan.plan_name}</p>
              </div>

              {/* Plan Variations */}
              <div className="p-6">
                <div className="space-y-4">
                  {getVariationsForPlan(plan.id).map((variation) => (
                    <div key={variation.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{variation.variation_display_name}</h3>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-green-600 font-bold text-lg">
                            <DollarSign className="h-5 w-5 mr-1" />
                            {centsToDollars(variation.price_amount).toFixed(2)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {getBillingFrequencyText(variation.billing_frequency)}
                          </span>
                        </div>
                      </div>



                      {/* Description */}
                      {variation.plan_variation_description && (
                        <div 
                          className="text-sm text-gray-700 mb-4 p-3 bg-white rounded-lg border border-gray-200 plan-description"
                          dangerouslySetInnerHTML={{ __html: variation.plan_variation_description }}
                        />
                      )}

                      {/* Action Button */}
                      {isUserSubscribedToVariation(variation.square_variation_id) ? (
                        <div className="w-full bg-green-100 text-green-700 py-3 px-4 rounded-xl font-medium flex items-center justify-center">
                          <Check className="h-5 w-5 mr-2" />
                          Already Subscribed
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleSubscribe(variation.square_variation_id)}
                          className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
                        >
                          <Calendar className="h-5 w-5 mr-2" />
                          Subscribe Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {plans.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Plans Available</h3>
            <p className="text-gray-600 text-sm">Check back later for new subscription plans.</p>
          </div>
        )}

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Complete Subscription</h3>
                <button
                  onClick={closePaymentForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <SquarePaymentForm
                planVariationId={selectedVariationId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
