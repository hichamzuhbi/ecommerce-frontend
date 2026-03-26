import { axiosInstance } from "./axios.instance";
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
    const { data } = await axiosInstance.post<ApiResponse<User>>(
      "/auth/register-admin",
      payload,
    );
    return data.data;
  },

  me: async (): Promise<User> => {
    const { data } = await axiosInstance.get<ApiResponse<User>>("/auth/me");
    return data.data;
  },
};
