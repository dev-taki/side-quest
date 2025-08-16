import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '../../services/authService';

export interface UserSubscription {
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
  last_4: string;
  subscriber_credit: number;
  guest_credit: number;
}

interface SubscriptionState {
  userSubscriptions: UserSubscription[];
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  userSubscriptions: [],
  loading: false,
  error: null,
};

export const fetchUserSubscriptions = createAsyncThunk(
  'subscription/fetchUserSubscriptions',
  async (businessId: string) => {
    const response = await fetch(
      `https://xwqm-zvzg-uzfr.n7e.xano.io/api:X2pOe3_k/subscription/client/user-subscription?business_id=${businessId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AuthService.getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user subscriptions');
    }

    return response.json();
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptions: (state) => {
      state.userSubscriptions = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSubscriptions.fulfilled, (state, action: PayloadAction<UserSubscription[]>) => {
        state.loading = false;
        state.userSubscriptions = action.payload;
      })
      .addCase(fetchUserSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch subscriptions';
      });
  },
});

export const { clearSubscriptions } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
