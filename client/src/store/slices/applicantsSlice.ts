import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';

interface Applicant {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  location: string;
  skills?: unknown[];
  experience?: unknown[];
  education?: unknown[];
  projects?: unknown[];
  availability?: unknown;
  resumeText: string;
  source: string;
  createdAt: string;
}

interface ApplicantsState {
  applicants: Applicant[];
  loading: boolean;
  error: string | null;
}

const initialState: ApplicantsState = {
  applicants: [],
  loading: false,
  error: null,
};

export const fetchApplicants = createAsyncThunk('applicants/fetchApplicants', async () => {
  const response = await api.applicants.list();
  return response;
});

const applicantsSlice = createSlice({
  name: 'applicants',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicants.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchApplicants.fulfilled, (state, action) => {
        state.loading = false;
        state.applicants = action.payload;
      })
      .addCase(fetchApplicants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch applicants';
      });
  },
});

export default applicantsSlice.reducer;