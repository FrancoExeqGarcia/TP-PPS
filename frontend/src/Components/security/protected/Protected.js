import { useContext } from "react";
import { Navigate } from "react-router";
import { AuthenticationContext } from "../../services/authenticationContext/authentication.context";
const Protected = ({ children }) => {
  const { user } = useContext(AuthenticationContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  } else return children;
};

export default Protected;
