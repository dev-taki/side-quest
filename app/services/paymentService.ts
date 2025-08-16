const API_BASE_URL = 'https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k';

import { AuthService } from './authService';

export interface CardData {
  sourceId: string;
  cardToken: string;
  postalCode: string;
  countryCode: string;
  cardHolderName: string;
  business_id: string;
}

export interface SubscriptionData {
  business_id: string;
  plan_variation_id: string;
  card_id: string;
}

export interface AddCardResponse {
  id: number;
  token: string;
  last_4: string;
  card_id: string;
  user_id: number;
  exp_year: number;
  exp_month: number;
  source_id: string;
  card_brand: string;
  created_at: number;
  card_payload: {
    id: string;
    bin: string;
    last_4: string;
    enabled: boolean;
    hsa_fsa: boolean;
    version: number;
    exp_year: number;
    card_type: string;
    exp_month: number;
    card_brand: string;
    created_at: string;
    customer_id: string;
    fingerprint: string;
    merchant_id: string;
    prepaid_type: string;
    billing_address: {
      country: string;
      postal_code: string;
    };
    cardholder_name: string;
  };
}

export interface CreateSubscriptionResponse {
  id: string;
  status: string;
  plan_id: string;
  card_id: string;
  created_at: string;
}

export class PaymentService {
  static async addCard(cardData: CardData): Promise<AddCardResponse> {
    const response = await fetch(`${API_BASE_URL}/card/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getAuthToken()}`,
      },
      body: JSON.stringify(cardData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add card');
    }

    return response.json();
  }

  static async createSubscription(subscriptionData: SubscriptionData): Promise<CreateSubscriptionResponse> {
    const response = await fetch(`${API_BASE_URL}/subscription/square/create-a-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getAuthToken()}`,
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create subscription');
    }

    return response.json();
  }
}
