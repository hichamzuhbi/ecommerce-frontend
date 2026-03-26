export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: "ADMIN" | "CUSTOMER";
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterAdminInput extends RegisterInput {
  adminSecret: string;
}

export interface AuthPayload {
  user: User;
  tokens: AuthTokens;
}

export interface RawAuthPayload {
  user: User;
  accessToken?: string;
  refreshToken?: string;
  tokens?: AuthTokens;
}
