import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('devboard_token');
    const savedUser = localStorage.getItem('devboard_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      authService.getMe()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('devboard_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { token, user: userData } = res.data;
    localStorage.setItem('devboard_token', token);
    localStorage.setItem('devboard_user', JSON.stringify(userData));
    setUser(userData);
    toast.success(`Welcome back, ${userData.fullName}!`);
    return userData;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    const { token, user: userData } = res.data;
    localStorage.setItem('devboard_token', token);
    localStorage.setItem('devboard_user', JSON.stringify(userData));
    setUser(userData);
    toast.success('Account created successfully!');
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('devboard_token');
    localStorage.removeItem('devboard_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
