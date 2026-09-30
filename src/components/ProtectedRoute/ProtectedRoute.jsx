import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const {
    isAuthenticated,
    user,
    sessionExpired,
  } = useAuth();

  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname + location.search,
          sessionExpired,
        }}
        replace
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.some((role) => user?.roles?.includes(role))
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;