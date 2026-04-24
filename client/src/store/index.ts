import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from './slices/jobsSlice';
import applicantsReducer from './slices/applicantsSlice';
import screeningReducer from './slices/screeningSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    applicants: applicantsReducer,
    screening: screeningReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;