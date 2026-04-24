import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';

interface ScreeningResult {
  _id: string;
  jobId: string;
  applicantId: {
    _id: string;
    name: string;
    email: string;
  };
  rank: number;
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  aiAuthenticityScore: number;
  aiFlags: string[];
  aiSuspiciousSegments: { text: string; reason: string }[];
  scoreBreakdown?: {
    skills: number;
    experience: number;
    education: number;
    context: number;
  };
}

interface ScreeningState {
  results: ScreeningResult[];
  loading: boolean;
  error: string | null;
}

const initialState: ScreeningState = {
  results: [],
  loading: false,
  error: null,
};

export const fetchScreeningResults = createAsyncThunk(
  'screening/fetchResults',
  async (jobId: string) => {
    const response = await api.screening.getResults(jobId);
    return response;
  }
);

export const runScreening = createAsyncThunk(
  'screening/runScreening',
  async ({ jobId, applicantIds }: { jobId: string; applicantIds: string[] }) => {
    const response = await api.screening.run(jobId, applicantIds);
    return response;
  }
);

const screeningSlice = createSlice({
  name: 'screening',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchScreeningResults.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchScreeningResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchScreeningResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch screening results';
      })
      .addCase(runScreening.pending, (state) => {
        state.loading = true;
      })
      .addCase(runScreening.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(runScreening.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to run screening';
      });
  },
});

export default screeningSlice.reducer;