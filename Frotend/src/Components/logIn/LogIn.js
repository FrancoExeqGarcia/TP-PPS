import React, { useRef, useState, useContext, useEffect } from "react";
import "./Login.css";
import { useNavigate } from "react-router";
import { AuthenticationContext } from "../services/authenticationContext/authentication.context"; //fijar c
import ToggleTheme from "../ui/toggleTheme/ToggleTheme";
import ComboLanguage from "../ui/comboLanguage/ComboLanguaje";
import { ThemeContext } from "../services/themeContext/theme.context"; // Importa ThemeContext
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const { theme } = useContext(ThemeContext); // Usa ThemeContext para obtener el tema
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { handleLogin } = useContext(AuthenticationContext);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const navigate = useNavigate();
  const translate = useTranslation();

  useEffect(() => {
    fetch("https://task-minder.onrender.com/users", {
      headers: {
        accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((usersData) => {
        setUsers(usersData);
      })
      .catch((error) => console.log(error));
  }, []);

  const customAlert = (messageKey) => {
    const translatedMessage = translate(messageKey);
    window.alert(translatedMessage);
  };

  const emailChangeHandler = (event) => {
    if (emailRef.current.value.length > 0) {
      emailRef.current.style.borderColor = "";
      emailRef.current.style.outline = "";
    }
    setEmail(event.target.value);
  };

  const passwordChangeHandler = (event) => {
    setPassword(event.target.value);
  };

  const signInHandler = () => {
    if (
      emailRef.current.value.length === 0 ||
      passwordRef.current.value.length === 0
    ) {
      toast.warning(translate("complete_all_fields"));
      return;
    }

    const user = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!user) {
      toast.warning(translate("wrong_email_or_password"));
      return;
    }

    localStorage.setItem("userRole", user.role);
    localStorage.setItem("userID", user.id);
    handleLogin(email, user.role);
    navigate("/home");
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
            ref={emailRef}
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            placeholder={translate("password")}
            type="password"
            onChange={passwordChangeHandler}
            value={password}
            ref={passwordRef}
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

export default Login;
