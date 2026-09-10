import { createContext, useContext, useState, useEffect } from 'react';
import Spinner from './components/Spinner'

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On app load, restore session from a stored token
  useEffect(() => {
    if (!token) { setLoading(false); return; }

    fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, login, logout, loading }}>
      {loading ? <Spinner /> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);