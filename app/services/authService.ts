const API_BASE_URL = 'https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k';

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  authToken: string;
}

export interface UserProfile {
  id: number;
  created_at: number;
  name: string;
  email: string;
  square_customer_id: string;
  role: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
}

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  }
};

const getCookie = (name: string): string | null => {
  if (typeof window !== 'undefined') {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};

const removeCookie = (name: string): void => {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

export class AuthService {
  static async signup(data: SignupData): Promise<AuthResponse> {
    return this.apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        business_id: 'a16c462c-e0e8-45f9-81d4-a344874fc46c'
      }),
    });
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    return this.apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        business_id: 'a16c462c-e0e8-45f9-81d4-a344874fc46c'
      }),
    });
  }

  static setAuthToken(token: string): void {
    setCookie('side-quest', token, 7); // Store for 7 days
    // Clear PWA install dismiss flag on successful authentication
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pwa-install-dismissed');
    }
  }

  static getAuthToken(): string | null {
    return getCookie('side-quest');
  }

  static removeAuthToken(): void {
    removeCookie('side-quest');
  }

  static isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Helper method to get headers with auth token for API requests
  static getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Generic API request method that always includes the auth token
  static async apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getAuthHeaders();
    
    // Merge custom headers with auth headers
    const finalHeaders = {
      ...headers,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers: finalHeaders,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'API request failed');
    }

    return result;
  }

  // Get user profile information
  static async getUserProfile(): Promise<UserProfile> {
    return this.apiRequest<UserProfile>('/auth/me');
  }
}
