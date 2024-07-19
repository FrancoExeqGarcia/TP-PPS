import React from "react";
import Swal from "sweetalert2";

import { useAuth } from "../../services/authenticationContext/authentication.context";
import { useNavigate } from "react-router";
import useTranslation from "../../custom/useTranslation/useTranslation";

const LogOut = ({ className }) => {
  const { logout } = useAuth();
  const translate = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      icon: "question",
      title: "Logging Out",
      text: "Are you sure you want to log out?",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          timer: 1500,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
          willClose: () => {
            logout();
            navigate("/login");
          },
        });
      }
    });
  };

  return (
    <button
      style={{ marginLeft: "12px" }}
      className={className}
      onClick={handleLogout}
    >
      {translate("logout")}
    </button>
  );
};

export default LogOut;
