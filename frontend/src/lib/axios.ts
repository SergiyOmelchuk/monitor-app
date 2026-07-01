import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { RefreshResponse } from '@/features/auth/types/auth.types';

export const ACCESS_TOKEN_KEY = 'auth_access_token';
export const REFRESH_TOKEN_KEY = 'auth_refresh_token';

const baseURL = import.meta.env.VITE_API_URL as string;

export const axiosBase: AxiosInstance = axios.create({ baseURL });

export const axiosAuth: AxiosInstance = axios.create({ baseURL });

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  });
  failedQueue = [];
}

function clearTokensAndRedirect(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.location.href = '/login';
}

axiosAuth.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosAuth.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      // No session to refresh — surface the 401 so callers (e.g. the auth
      // bootstrap) can treat the user as logged out. Avoid a hard redirect
      // here, which would loop on public pages like /login and /register.
      return Promise.reject(error);
    }

    // A refresh is already in flight — queue this request and retry it once a
    // fresh access token is available.
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosAuth(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axiosBase.post<RefreshResponse>('/api/auth/refresh', {
        refreshToken,
      });
      const newAccessToken = data.accessToken;

      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosAuth(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokensAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
