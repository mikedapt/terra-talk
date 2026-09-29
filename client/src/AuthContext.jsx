import { createContext, useContext, useState, useEffect } from 'react';
import Spinner from './components/Spinner'

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [banned, setBanned] = useState(false);

  // On app load, restore session from a stored token
  useEffect(() => {
    if (!token) { setLoading(false); return; }

    fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (res.status === 403) {
          const data = await res.json();
          if (data.error === 'banned') setBanned(true);
          localStorage.removeItem('token');
          setToken(null);
          return null;
        }
        return res.ok ? res.json() : Promise.reject();
      })
      .then(data => { if (data) setUser(data.user); })
      .catch(() => { localStorage.removeItem('token'); setToken(null); })
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
    <AuthContext.Provider value={{ user, token, setUser, login, logout, loading, banned }}>
      {loading ? <Spinner /> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);