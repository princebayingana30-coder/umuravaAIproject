import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';

interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  createdAt: string;
}

interface JobsState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  loading: false,
  error: null,
};

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
  const response = await api.jobs.list();
  return response;
});

export const createJob = createAsyncThunk('jobs/createJob', async (jobData: Omit<Job, '_id' | 'createdAt'>) => {
  const response = await api.jobs.create(jobData);
  return response;
});

export const fetchJob = createAsyncThunk('jobs/fetchJob', async (id: string) => {
  const response = await api.jobs.get(id);
  return response;
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch jobs';
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
      });
  },
});

export default jobsSlice.reducer;