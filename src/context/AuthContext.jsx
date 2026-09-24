import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext();

function decodeToken(token) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];

    const decodedPayload = atob(
      payload.replace(/-/g, "+").replace(/_/g, "/")
    );

    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
}

function isTokenExpired(token) {
  const decoded = decodeToken(token);

  if (!decoded?.exp) {
    return true;
  }

  return decoded.exp * 1000 <= Date.now();
}

export function AuthProvider({ children }) {
  const [sessionExpired, setSessionExpired] = useState(false);

  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      return null;
    }

    if (isTokenExpired(storedToken)) {
      localStorage.removeItem("token");
      return null;
    }

    return storedToken;
  });

  const user = decodeToken(token);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setSessionExpired(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setSessionExpired(false);
  };

  const expireSession = () => {
    localStorage.removeItem("token");
    setToken(null);
    setSessionExpired(true);
  };

  useEffect(() => {
    if (!token) return;

    const decoded = decodeToken(token);

    if (!decoded?.exp) {
      expireSession();
      return;
    }

    const expirationTime = decoded.exp * 1000;
    const remainingTime = expirationTime - Date.now();

    if (remainingTime <= 0) {
      expireSession();
      return;
    }

    const timeout = setTimeout(() => {
      expireSession();
    }, remainingTime);

    return () => clearTimeout(timeout);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        sessionExpired,
        login,
        logout,
        expireSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}