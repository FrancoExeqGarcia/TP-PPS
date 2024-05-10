import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import styled, { keyframes } from "styled-components";
import ComboLanguage from "../../ui/comboLanguage/ComboLanguaje";
import useTranslation from "../../../custom/useTranslation/useTranslation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

const scaleAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const NotFoundContainer = styled.div`
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 100px auto;
  max-width: 1000px;
  animation: ${scaleAnimation} 1s ease-in-out; // Apply the animation
`;

const Forbidden = () => {
  const navigate = useNavigate();
  const translate = useTranslation();

  const backToHomePageHandler = () => {
    navigate("/login");
  };

  return (
    <NotFoundContainer>
      <ComboLanguage />
      <h2 className="my-4">
        <FontAwesomeIcon icon={faExclamationCircle} /> {translate("forbidden")}
      </h2>
      <Button onClick={backToHomePageHandler}>{translate("return")}</Button>
    </NotFoundContainer>
  );
};

export default Forbidden;
