import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  is_verified: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  continueAsGuest: () => void;
  updateUser: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  refreshToken: () => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://app.vsfintech.in/alphanifty/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved auth on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('alphanifty_access_token');
    const savedUser = localStorage.getItem('alphanifty_user');
    const guestMode = localStorage.getItem('alphanifty_guest_mode');
    
    if (savedToken && savedUser) {
      setAccessToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      // Verify token is still valid
      verifyToken(savedToken);
    } else if (guestMode === 'true') {
      setIsGuest(true);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setUser(data.data);
          localStorage.setItem('alphanifty_user', JSON.stringify(data.data));
        } else {
          // Token invalid, clear auth
          clearAuth();
        }
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Token verification error:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        const { user: userData, access_token, refresh_token } = data.data;
        
        setUser(userData);
        setAccessToken(access_token);
        setIsGuest(false); // Clear guest mode when logging in
        
        // Save to localStorage
        localStorage.setItem('alphanifty_access_token', access_token);
        localStorage.setItem('alphanifty_refresh_token', refresh_token);
        localStorage.setItem('alphanifty_user', JSON.stringify(userData));
        localStorage.removeItem('alphanifty_guest_mode'); // Remove guest flag
        
        return;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message) {
        throw error; // Re-throw if it has a message (from API)
      }
      throw new Error('Network error. Please try again.');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    setUser(null);
    setAccessToken(null);
    setIsGuest(false);
    localStorage.removeItem('alphanifty_access_token');
    localStorage.removeItem('alphanifty_refresh_token');
    localStorage.removeItem('alphanifty_user');
    localStorage.removeItem('alphanifty_guest_mode');
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('alphanifty_guest_mode', 'true');
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      if (!accessToken) return { success: false, message: 'Not authenticated' };

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setUser(result.data);
        localStorage.setItem('alphanifty_user', JSON.stringify(result.data));
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message || 'Update failed' };
      }
    } catch (error) {
      console.error('Update error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('alphanifty_refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        const newAccessToken = data.data.access_token;
        setAccessToken(newAccessToken);
        localStorage.setItem('alphanifty_access_token', newAccessToken);
        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuth();
      return false;
    }
  };

  const value = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isGuest,
    isLoading,
    login,
    register,
    logout,
    continueAsGuest,
    updateUser,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
