import React, { useRef, useState, useContext } from "react";
import "./Login.css";
import { useNavigate } from "react-router";
import { useAuth } from "../services/authenticationContext/authentication.context";
import ToggleTheme from "../ui/toggleTheme/ToggleTheme";
import ComboLanguage from "../ui/comboLanguage/ComboLanguaje";
import { ThemeContext } from "../services/themeContext/theme.context";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LogIn = () => {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();

  const navigate = useNavigate();
  const translate = useTranslation();

  const emailChangeHandler = (event) => {
    setEmail(event.target.value);
  };

  const passwordChangeHandler = (event) => {
    setPassword(event.target.value);
  };

  const signInHandler = async () => {
    if (email.length === 0 || password.length === 0) {
      toast.warning(translate("complete_all_fields"));
      return;
    }

    try {
      await login(email, password);
      navigate("/home");
      setEmail("");
      setPassword("");
    } catch (error) {
      if(error.response.status === 500) {
        toast.error(translate("service_unavailable")); 
      } else {
        toast.error(translate("wrong_email_or_password"));
      }
    }
  };

  return (
    <div className="login-container">
      <div
        className={`login-box ${
          theme === "DARK" ? "login-box-dark" : "light-theme"
        }`}
      >
        <ComboLanguage />
        <h3 className="mb-4">{translate("welcome")}</h3>
        <div className="mb-3">
          <input
            className="form-control"
            placeholder={translate("email")}
            type="email"
            onChange={emailChangeHandler}
            value={email}
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            placeholder={translate("password")}
            type="password"
            onChange={passwordChangeHandler}
            value={password}
          />
        </div>
        <button
          onClick={signInHandler}
          className="btn btn-primary btn-block"
          type="button"
        >
          {translate("login")}
        </button>
        <br />
        <ToggleTheme />
      </div>
      <ToastContainer
        position="top-center"
        autoClose={500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        progressStyle={{ background: "blue" }}
      />
    </div>
  );
};

export default LogIn;
