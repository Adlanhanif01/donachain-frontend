import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bootstrapError, setBootstrapError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('donachain_token');
    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest('/user')
      .then(setUser)
      .catch((error) => {
        sessionStorage.removeItem('donachain_token');
        setBootstrapError(error.message);
      })
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(path, payload) {
    const result = await apiRequest(path, {
      method: 'POST',
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });
    sessionStorage.setItem('donachain_token', result.token);
    setUser(result.user);
    setBootstrapError('');
    return result.user;
  }

  async function logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      sessionStorage.removeItem('donachain_token');
      setUser(null);
    }
  }

  const value = {
    user,
    loading,
    bootstrapError,
    login: (payload) => authenticate('/auth/login', payload),
    register: (payload) => authenticate('/auth/register', payload),
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return context;
}
