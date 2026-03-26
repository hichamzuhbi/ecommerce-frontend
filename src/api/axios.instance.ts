import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL } from "../utils/constants";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "../utils/token.utils";
import type { ApiResponse } from "../types/api.types";
import type { AuthTokens } from "../types/auth.types";

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<(token: string | null) => void> = [];
let onUnauthorized: (() => void) | null = null;

export const registerUnauthorizedHandler = (handler: () => void): void => {
  onUnauthorized = handler;
};

const processQueue = (token: string | null): void => {
  failedQueue.forEach((callback) => callback(token));
  failedQueue = [];
};

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      onUnauthorized?.();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push((token) => {
          if (!token || !originalRequest.headers) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axiosInstance(originalRequest as AxiosRequestConfig));
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await axios.post<ApiResponse<AuthTokens>>(
        `${API_BASE_URL}/auth/refresh`,
        {
          refreshToken,
        },
      );

      const newTokens = response.data.data;
      saveTokens(newTokens.accessToken, newTokens.refreshToken);
      processQueue(newTokens.accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      }

      return axiosInstance(originalRequest as AxiosRequestConfig);
    } catch (refreshError) {
      processQueue(null);
      clearTokens();
      onUnauthorized?.();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
