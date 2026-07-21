import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { apiPrivate } from '../api/axios';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, username: null });
  const [loading, setLoading] = useState(true);

  const authRef = useRef(auth);
  authRef.current = auth;

  useEffect(() => {
    const persistSession = async () => {
      try {
        const response = await apiPrivate.post('/auth/refresh');

        setAuth({
          token: response.data.accessToken,
          username: response.data.username,
          role: response.data.role,
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
        const currentToken = authRef.current?.token;
        if (currentToken) {
          if (config.headers && typeof config.headers.set === 'function') {
            config.headers.set('Authorization', `Bearer ${currentToken}`);
          } else if (config.headers) {
            config.headers['Authorization'] = `Bearer ${currentToken}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseIntercept = apiPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        if (
          (error?.response?.status === 401 || error?.response?.status === 403) &&
          !prevRequest?._retry &&
          !prevRequest?.url?.includes('/auth/login') &&
          !prevRequest?.url?.includes('/auth/refresh')
        ) {
          prevRequest._retry = true;
          try {
            const response = await apiPrivate.post('/auth/refresh');
            const newAccessToken = response.data.accessToken;
            setAuth((prev) => ({ ...prev, token: newAccessToken }));
            if (prevRequest.headers && typeof prevRequest.headers.set === 'function') {
              prevRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
            } else if (prevRequest.headers) {
              prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            }
            return apiPrivate(prevRequest);
          } catch (refreshError) {
            setAuth({ token: null, username: null });
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
  }, []);

  const logout = async () => {
    try {
      await apiPrivate.post('/auth/logout');
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
