const API_BASE_URL = 'https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k';

import { AdminAuthService } from './adminAuthService';

export interface Item {
  id: number;
  created_at: number;
  item_name: string;
  item_display_name: string;
  item_description: string;
  item_price: number; // in cents
  item_sku: string;
  item_id: string;
  version: number;
  object_id: string;
  variations_id: string;
  Type: string;
}

export interface CreateItemData {
  business_id: string;
  item_name: string;
  item_display_name: string;
  item_description: string;
  item_price: number; // in cents
}

export interface UpdateItemData {
  business_id: string;
  item_name: string;
  item_display_name: string;
  item_description: string;
  item_price: number; // in cents
  item_id: string;
  Type: string;
}

// Utility function to convert dollars to cents
export const dollarsToCents = (dollars: number): number => {
  return Math.round(dollars * 100);
};

// Utility function to convert cents to dollars
export const centsToDollars = (cents: number): number => {
  return cents / 100;
};

export class ItemsService {
  // Get all items for vendor dashboard
  static async getVendorItems(businessId: string): Promise<Item[]> {
    const url = `${API_BASE_URL}/item/vendor-dashboard?business_id=${businessId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AdminAuthService.getAuthToken()}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch items');
    }

    return result;
  }

  // Add new item
  static async addItem(data: CreateItemData): Promise<Item> {
    const url = `${API_BASE_URL}/item/square/add`;
    
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
      throw new Error(result.message || 'Failed to add item');
    }

    return result;
  }

  // Update existing item
  static async updateItem(data: UpdateItemData): Promise<Item> {
    const url = `${API_BASE_URL}/item/square/update`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AdminAuthService.getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update item');
    }

    return result;
  }
}
