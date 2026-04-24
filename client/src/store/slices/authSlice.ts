import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/services/api';

interface AuthUser {
  email: string;
  name?: string;
  picture?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: null,
};

// Decode JWT payload (without verification — just for reading claims client-side)
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.auth.login(email, password);
      if (!response?.token) {
        return rejectWithValue(response?.error || 'Login failed');
      }
      window.localStorage.setItem('talentiq_token', response.token);

      // Decode user info from JWT
      const payload = decodeJwtPayload(response.token);
      return {
        token: response.token,
        user: {
          email: (payload?.email as string) || email,
          name: (payload?.name as string) || email.split('@')[0],
          picture: payload?.picture as string | undefined,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Restore session from localStorage on app load
export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { rejectWithValue }) => {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('talentiq_token') : null;
  if (!token) return rejectWithValue('No token');

  const payload = decodeJwtPayload(token);
  if (!payload) {
    window.localStorage.removeItem('talentiq_token');
    return rejectWithValue('Invalid token');
  }

  // Check expiry
  const exp = payload.exp as number;
  if (exp && Date.now() / 1000 > exp) {
    window.localStorage.removeItem('talentiq_token');
    return rejectWithValue('Token expired');
  }

  return {
    token,
    user: {
      email: (payload.email as string) || '',
      name: (payload.name as string) || (payload.email as string)?.split('@')[0] || 'User',
      picture: payload.picture as string | undefined,
    },
  };
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  window.localStorage.removeItem('talentiq_token');
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<{ token: string; user: AuthUser }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.token = null;
        state.user = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;