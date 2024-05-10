import { useContext } from "react";
import { Navigate } from "react-router";
import { AuthenticationContext } from "../../services/authenticationContext/authentication.context";
const Protected = ({ children, requiredRole }) => {
  const { user, role } = useContext(AuthenticationContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  } else if (requiredRole && role !== requiredRole) {
    return <Navigate to="/forbidden" replace />;
  } else {
    return children;
  }
};
export default Protected;
