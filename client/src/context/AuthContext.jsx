import { createContext, useState, useEffect, useContext } from 'react';
import { apiPrivate } from '../api/axios';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, username: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const persistSession = async () => {
      try {
        const response = await apiPrivate.post('/refresh');

        setAuth({
          token: response.data.accessToken,
          username: response.data.username,
        });
      } catch (err) {
        console.log('No active user session detected.');
      } finally {
        setLoading(false);
      }
    };

    persistSession();
  }, []);

  useEffect(() => {
    const requestIntercept = apiPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers['Authorization'] && auth.token) {
          config.headers['Authorization'] = `Bearer ${auth.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseIntercept = apiPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true;
          try {
            const response = await apiPrivate.post('/refresh');
            const newAccessToken = response.data.accessToken;
            setAuth((prev) => ({ ...prev, token: newAccessToken }));
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return apiPrivate(prevRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      apiPrivate.interceptors.request.eject(requestIntercept);
      apiPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth]);

  const logout = async () => {
    try {
      await apiPrivate.post('/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setAuth({ token: null, username: null });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        loading,
        user: auth.token ? { username: auth.username } : null,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
