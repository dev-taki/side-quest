import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  stats: {
    totalQuests: number;
    completedQuests: number;
    successRate: number;
  };
}

const initialState: UserState = {
  preferences: {
    theme: 'light',
    notifications: true,
  },
  stats: {
    totalQuests: 12,
    completedQuests: 10,
    successRate: 85,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.preferences.theme = action.payload;
    },
    toggleNotifications: (state) => {
      state.preferences.notifications = !state.preferences.notifications;
    },
    updateStats: (state, action: PayloadAction<Partial<UserState['stats']>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
});

export const { setTheme, toggleNotifications, updateStats } = userSlice.actions;
export default userSlice.reducer;
