const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('talentiq_token');
}

async function request(path: string, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  return res.json();
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      return request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    },
  },
  jobs: {
    create: async (data: Record<string, unknown>) => {
      return request('/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    list: async () => {
      return request('/jobs');
    },
    get: async (id: string) => {
      return request(`/jobs/${id}`);
    },
    delete: async (id: string) => {
      return request(`/jobs/${id}`, { method: 'DELETE' });
    },
  },
  applicants: {
    upload: async (formData: FormData) => {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/applicants/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return res.json();
    },
    addCandidate: async (formData: FormData) => {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/applicants/add-candidate`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return res.json();
    },
    ingestSample: async () => {
      return request('/applicants/ingest/sample', { method: 'POST' });
    },
    list: async () => {
      return request('/applicants');
    },
    getById: async (id: string) => {
      return request(`/applicants/${id}`);
    },
  },
  screening: {
    run: async (jobId: string, applicantIds: string[]) => {
      return request('/screening/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, applicantIds }),
      });
    },
    getResults: async (jobId: string) => {
      return request(`/screening/job/${jobId}`);
    },
    updateDecision: async (resultId: string, decision: string, reason: string) => {
      return request('/screening/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, decision, reason }),
      });
    },
    getJobAnalytics: async (jobId: string) => {
      return request(`/screening/analytics/job/${jobId}`);
    },
    getDashboardAnalytics: async () => {
      return request('/screening/analytics/dashboard');
    },
    deleteResult: async (id: string) => {
      return request(`/screening/${id}`, { method: 'DELETE' });
    },
  },
};
