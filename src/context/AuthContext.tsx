/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type { PropsWithChildren } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import { registerUnauthorizedHandler } from '../api/axios.instance';
import type {
  LoginInput,
  RegisterAdminInput,
  RegisterInput,
  User,
} from '../types/auth.types';
import { clearTokens, getAccessToken, saveTokens } from '../utils/token.utils';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'START_LOADING' }
  | { type: 'STOP_LOADING' }
  | { type: 'SET_AUTH'; payload: User }
  | { type: 'LOGOUT' };

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterInput | RegisterAdminInput, asAdmin?: boolean) => Promise<User>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, isLoading: true };
    case 'STOP_LOADING':
      return { ...state, isLoading: false };
    case 'SET_AUTH':
      return {
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const rawMessage = error.response?.data?.message;
    if (Array.isArray(rawMessage)) {
      return rawMessage.join(', ');
    }
    if (typeof rawMessage === 'string' && rawMessage.trim()) {
      return rawMessage;
    }
    return fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const logout = useCallback(() => {
    clearTokens();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const loadUser = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      dispatch({ type: 'LOGOUT' });
      return;
    }

    dispatch({ type: 'START_LOADING' });
    try {
      const user = await authApi.me();
      dispatch({ type: 'SET_AUTH', payload: user });
    } catch {
      logout();
    }
  }, [logout]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    dispatch({ type: 'START_LOADING' });
    try {
      const payload: LoginInput = { email, password };
      const result = await authApi.login(payload);
      saveTokens(result.tokens.accessToken, result.tokens.refreshToken);
      dispatch({ type: 'SET_AUTH', payload: result.user });
      toast.success('Welcome back!');
      return result.user;
    } catch (error) {
      dispatch({ type: 'STOP_LOADING' });
      const message = getErrorMessage(error, 'Invalid email or password.');
      toast.error(message);
      throw error;
    }
  }, []);

  const register = useCallback(
    async (
      payload: RegisterInput | RegisterAdminInput,
      asAdmin = false,
    ): Promise<User> => {
      dispatch({ type: 'START_LOADING' });
      try {
        if (asAdmin) {
          await authApi.registerAdmin(payload as RegisterAdminInput);
        } else {
          await authApi.register(payload as RegisterInput);
        }

        const loginResult = await authApi.login({
          email: payload.email,
          password: payload.password,
        });
        saveTokens(loginResult.tokens.accessToken, loginResult.tokens.refreshToken);
        dispatch({ type: 'SET_AUTH', payload: loginResult.user });
        toast.success('Account created successfully.');
        return loginResult.user;
      } catch (error) {
        dispatch({ type: 'STOP_LOADING' });
        const message = getErrorMessage(
          error,
          'Could not create account. Please try again.',
        );
        toast.error(message);
        throw error;
      }
    },
    [],
  );

  useEffect(() => {
    registerUnauthorizedHandler(logout);
  }, [logout]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
      loadUser,
    }),
    [loadUser, login, logout, register, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export const useAuth = useAuthContext;
