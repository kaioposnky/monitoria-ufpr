import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getAuthToken, setAuthToken } from '../../shared/api/http';
import { loadCurrentUser, loginRequest } from './auth.api';
import type { AuthUser, LoginPayload } from './auth.types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(getAuthToken()));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    loadCurrentUser(controller.signal)
      .then((loadedUser) => {
        if (!controller.signal.aborted) {
          setUser(loadedUser);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAuthToken(null);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [token]);

  const login = useCallback(async (payload: LoginPayload): Promise<AuthUser> => {
    const session = await loginRequest(payload);
    setAuthToken(session.token);
    setToken(session.token);
    setUser(session.user);
    return session.user;
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getAuthToken()) return;
    const loadedUser = await loadCurrentUser();
    setUser(loadedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider.');
  }
  return ctx;
}
