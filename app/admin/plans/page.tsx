'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Edit, DollarSign, Calendar, Loader2, X, Save, Users, Package } from 'lucide-react';
import { AdminAuthService } from '../../services/adminAuthService';
import { PlansService, SubscriptionPlan, PlanVariation, CreatePlanData, CreateVariationData, dollarsToCents, centsToDollars } from '../../services/plansService';
import { ItemsService, Item } from '../../services/itemsService';
import AdminBottomNav from '../../components/AdminBottomNav';
import RichTextEditor from '../../components/RichTextEditor';

const BUSINESS_ID = 'a16c462c-e0e8-45f9-81d4-a344874fc46c';

export default function PlansManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [variations, setVariations] = useState<PlanVariation[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showVariationForm, setShowVariationForm] = useState(false);
  const [showEditVariationForm, setShowEditVariationForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<PlanVariation | null>(null);
  const [planFormData, setPlanFormData] = useState({
    plan_name: '',
    plan_display_name: '',
    all_items: false,
    eligible_item_ids: [] as string[]
  });
  const [variationFormData, setVariationFormData] = useState({
    variation_name: '',
    variation_display_name: '',
    billing_frequency: 'WEEKLY',
    price_amount: '',
    plan_variation_description: ''
  });
  const [editVariationFormData, setEditVariationFormData] = useState({
    status: '',
    plan_variation_description: ''
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

        await loadData();
      } catch (error) {
        AdminAuthService.removeAuthToken();
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const loadData = async () => {
    try {
      const [plansData, variationsData, itemsData] = await Promise.all([
        PlansService.getSubscriptionPlans(BUSINESS_ID),
        PlansService.getPlanVariations(BUSINESS_ID),
        ItemsService.getVendorItems(BUSINESS_ID)
      ]);
      
      setPlans(plansData);
      setVariations(variationsData);
      setItems(itemsData);
    } catch (error: any) {
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = () => {
    setPlanFormData({
      plan_name: '',
      plan_display_name: '',
      all_items: false,
      eligible_item_ids: []
    });
    setShowPlanForm(true);
    setError('');
  };

  const handleAddVariation = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setVariationFormData({
      variation_name: '',
      variation_display_name: '',
      billing_frequency: 'WEEKLY',
      price_amount: '',
      plan_variation_description: ''
    });
    setShowVariationForm(true);
    setError('');
  };

  const handleEditVariation = (variation: PlanVariation) => {
    setSelectedVariation(variation);
    setEditVariationFormData({
      status: variation.status,
      plan_variation_description: variation.plan_variation_description || ''
    });
    setShowEditVariationForm(true);
    setError('');
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const createData: CreatePlanData = {
        business_id: BUSINESS_ID,
        plan_name: planFormData.plan_name,
        plan_display_name: planFormData.plan_display_name,
        all_items: planFormData.all_items,
        eligible_item_ids: planFormData.eligible_item_ids
      };

      await PlansService.createPlan(createData);
      await loadData();
      setShowPlanForm(false);
    } catch (error: any) {
      setError(error.message || 'Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVariationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const createData: CreateVariationData = {
        business_id: BUSINESS_ID,
        plan_id: selectedPlan!.id,
        variation_name: variationFormData.variation_name,
        variation_display_name: variationFormData.variation_display_name,
        billing_frequency: variationFormData.billing_frequency,
        price_amount: dollarsToCents(parseFloat(variationFormData.price_amount) || 0),
        plan_variation_description: variationFormData.plan_variation_description
      };

      await PlansService.createVariation(createData);
      await loadData();
      setShowVariationForm(false);
      setSelectedPlan(null);
    } catch (error: any) {
      setError(error.message || 'Failed to create variation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditVariationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const updateData = {
        business_id: BUSINESS_ID,
        plan_id: selectedVariation!.plan_id,
        status: editVariationFormData.status,
        plan_variation_description: editVariationFormData.plan_variation_description
      };

      const response = await fetch(
        'https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k/subscription/square/subscription-plan-variation',
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
        throw new Error(errorData.message || 'Failed to update variation');
      }

      await loadData();
      setShowEditVariationForm(false);
      setSelectedVariation(null);
    } catch (error: any) {
      setError(error.message || 'Failed to update variation');
    } finally {
      setSubmitting(false);
    }
  };

  const getVariationsForPlan = (planId: number) => {
    return variations.filter(v => v.plan_id === planId);
  };

  const getEligibleItems = (plan: SubscriptionPlan) => {
    if (plan.all_items) return items;
    return items.filter(item => plan.eligible_item_ids.includes(item.item_id));
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
            <Calendar className="h-8 w-8 text-purple-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Plan Management</h1>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-24">
        {/* Add Plan Button */}
        <div className="mb-6">
          <button
            onClick={handleAddPlan}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Plan
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Plans List */}
        <div className="space-y-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.plan_display_name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{plan.plan_name}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      plan.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {plan.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {plan.all_items ? 'All Items' : `${plan.eligible_item_ids.length} Items`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddVariation(plan)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Plan Variations */}
              <div className="space-y-3">
                {getVariationsForPlan(plan.id).map((variation) => (
                  <div key={variation.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{variation.variation_display_name}</h4>
                          <button
                            onClick={() => handleEditVariation(variation)}
                            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">{variation.variation_name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            variation.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {variation.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="flex items-center text-green-600 font-semibold">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {centsToDollars(variation.price_amount).toFixed(2)}
                        </div>
                        <span className="text-xs text-gray-500 capitalize">{variation.billing_frequency.toLowerCase()}</span>
                      </div>
                    </div>
                    
                    {variation.plan_variation_description && (
                      <div 
                        className="text-sm text-gray-700"
                        dangerouslySetInnerHTML={{ __html: variation.plan_variation_description }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Eligible Items */}
              {!plan.all_items && plan.eligible_item_ids.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Eligible Items:</h4>
                  <div className="flex flex-wrap gap-2">
                    {getEligibleItems(plan).map((item) => (
                      <span key={item.id} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        {item.item_display_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {plans.length === 0 && !loading && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No plans found. Add your first plan to get started.</p>
          </div>
        )}
      </main>

      {/* Add Plan Form Modal */}
      {showPlanForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Plan</h2>
                <button
                  onClick={() => setShowPlanForm(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handlePlanSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    value={planFormData.plan_name}
                    onChange={(e) => setPlanFormData({...planFormData, plan_name: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter plan name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={planFormData.plan_display_name}
                    onChange={(e) => setPlanFormData({...planFormData, plan_display_name: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter display name"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={planFormData.all_items}
                      onChange={(e) => setPlanFormData({...planFormData, all_items: e.target.checked})}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Include all items</span>
                  </label>
                </div>

                {!planFormData.all_items && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Eligible Items
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {items.map((item) => (
                        <label key={item.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={planFormData.eligible_item_ids.includes(item.item_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPlanFormData({
                                  ...planFormData,
                                  eligible_item_ids: [...planFormData.eligible_item_ids, item.item_id]
                                });
                              } else {
                                setPlanFormData({
                                  ...planFormData,
                                  eligible_item_ids: planFormData.eligible_item_ids.filter(id => id !== item.item_id)
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{item.item_display_name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPlanForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Create Plan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Variation Form Modal */}
      {showVariationForm && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Variation to {selectedPlan.plan_display_name}</h2>
                <button
                  onClick={() => setShowVariationForm(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleVariationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variation Name *
                  </label>
                  <input
                    type="text"
                    value={variationFormData.variation_name}
                    onChange={(e) => setVariationFormData({...variationFormData, variation_name: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter variation name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={variationFormData.variation_display_name}
                    onChange={(e) => setVariationFormData({...variationFormData, variation_display_name: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Frequency *
                  </label>
                  <select
                    value={variationFormData.billing_frequency}
                    onChange={(e) => setVariationFormData({...variationFormData, billing_frequency: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variationFormData.price_amount}
                      onChange={(e) => setVariationFormData({...variationFormData, price_amount: e.target.value})}
                      required
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <RichTextEditor
                    value={variationFormData.plan_variation_description}
                    onChange={(html) => setVariationFormData({...variationFormData, plan_variation_description: html})}
                    placeholder="Enter variation description..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowVariationForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Create Variation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Variation Form Modal */}
      {showEditVariationForm && selectedVariation && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Variation</h2>
                <button
                  onClick={() => setShowEditVariationForm(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleEditVariationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variation Name
                  </label>
                  <input
                    type="text"
                    value={selectedVariation.variation_display_name}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={editVariationFormData.status}
                    onChange={(e) => setEditVariationFormData({...editVariationFormData, status: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <RichTextEditor
                    value={editVariationFormData.plan_variation_description}
                    onChange={(html) => setEditVariationFormData({...editVariationFormData, plan_variation_description: html})}
                    placeholder="Enter variation description..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditVariationForm(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Update Variation
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
