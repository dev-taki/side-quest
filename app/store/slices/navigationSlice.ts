import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type TabType = 'home' | 'plans' | 'schedule' | 'profile';

interface NavigationState {
  activeTab: TabType;
}

const initialState: NavigationState = {
  activeTab: 'home',
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<TabType>) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = navigationSlice.actions;
export default navigationSlice.reducer;
