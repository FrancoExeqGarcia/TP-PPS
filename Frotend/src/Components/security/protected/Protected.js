import { Navigate } from "react-router";
import { useAuth } from "../../../services/authenticationContext/authentication.context";

const Protected = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  } else if (requiredRole && user.UserType !== requiredRole) {
    return <Navigate to="/forbidden" replace />;
  } else {
    return children;
  }
};
export default Protected;
