import { axiosInstance } from "./axios.instance";
import { isAxiosError } from "axios";
import type { ApiResponse } from "../types/api.types";
import type {
  AuthPayload,
  LoginInput,
  RawAuthPayload,
  RegisterAdminInput,
  RegisterInput,
  User,
} from "../types/auth.types";

const normalizeAuthPayload = (payload: RawAuthPayload): AuthPayload => {
  const accessToken = payload.tokens?.accessToken ?? payload.accessToken;
  const refreshToken = payload.tokens?.refreshToken ?? payload.refreshToken;

  if (!payload.user || !accessToken || !refreshToken) {
    throw new Error("Invalid auth response payload.");
  }

  return {
    user: payload.user,
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

export const authApi = {
  login: async (payload: LoginInput): Promise<AuthPayload> => {
    const { data } = await axiosInstance.post<ApiResponse<RawAuthPayload>>(
      "/auth/login",
      payload,
    );
    return normalizeAuthPayload(data.data);
  },

  register: async (payload: RegisterInput): Promise<User> => {
    const { data } = await axiosInstance.post<ApiResponse<User>>(
      "/auth/register",
      payload,
    );
    return data.data;
  },

  registerAdmin: async (payload: RegisterAdminInput): Promise<User> => {
    try {
      const { data } = await axiosInstance.post<ApiResponse<User>>(
        "/auth/register-admin",
        payload,
      );
      return data.data;
    } catch (error) {
      // Some backend deployments expose only /auth/register for all roles.
      if (isAxiosError(error) && error.response?.status === 404) {
        const { data } = await axiosInstance.post<ApiResponse<User>>(
          "/auth/register",
          {
            ...payload,
            role: "ADMIN",
          },
        );
        return data.data;
      }

      throw error;
    }
  },

  me: async (): Promise<User> => {
    const { data } = await axiosInstance.get<ApiResponse<User>>("/auth/me");
    return data.data;
  },
};
