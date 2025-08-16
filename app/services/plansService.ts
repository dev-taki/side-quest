const API_BASE_URL = 'https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k';

import { AdminAuthService } from './adminAuthService';

export interface SubscriptionPlan {
  id: number;
  created_at: number;
  plan_name: string;
  plan_display_name: string;
  square_plan_id: string;
  all_items: boolean;
  eligible_item_ids: string[];
  square_version: number;
  status: string;
}

export interface PlanVariation {
  id: number;
  created_at: number;
  plan_id: number;
  square_plan_id: string;
  square_variation_id: string;
  variation_name: string;
  variation_display_name: string;
  billing_frequency: string;
  price_amount: number; // in cents
  currency: string;
  square_version: number;
  status: string;
  plan_variation_description: string;
}

export interface CreatePlanData {
  business_id: string;
  plan_name: string;
  plan_display_name: string;
  all_items: boolean;
  eligible_item_ids: string[];
}

export interface CreateVariationData {
  business_id: string;
  plan_id: number;
  variation_name: string;
  variation_display_name: string;
  billing_frequency: string;
  price_amount: number; // in cents
  plan_variation_description: string;
}

// Utility function to convert dollars to cents
export const dollarsToCents = (dollars: number): number => {
  return Math.round(dollars * 100);
};

// Utility function to convert cents to dollars
export const centsToDollars = (cents: number): number => {
  return cents / 100;
};

export class PlansService {
  // Get all subscription plans
  static async getSubscriptionPlans(businessId: string): Promise<SubscriptionPlan[]> {
    const url = `${API_BASE_URL}/subscription/square/subscription-plan?business_id=${businessId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AdminAuthService.getAuthToken()}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch subscription plans');
    }

    return result;
  }

  // Get all plan variations
  static async getPlanVariations(businessId: string): Promise<PlanVariation[]> {
    const url = `${API_BASE_URL}/subscription/square/subscription-plan-variation?business_id=${businessId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AdminAuthService.getAuthToken()}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch plan variations');
    }

    return result;
  }

  // Create new subscription plan
  static async createPlan(data: CreatePlanData): Promise<SubscriptionPlan> {
    const url = `${API_BASE_URL}/subscription/square/subscription-plan`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AdminAuthService.getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create subscription plan');
    }

    return result;
  }

  // Create new plan variation
  static async createVariation(data: CreateVariationData): Promise<PlanVariation> {
    const url = `${API_BASE_URL}/subscription/square/subscription-plan-variation`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AdminAuthService.getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create plan variation');
    }

    return result;
  }
}
