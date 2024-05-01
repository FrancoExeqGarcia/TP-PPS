import React, { useContext } from "react";
import { Form } from "react-bootstrap";
import useTranslation from "../../../custom/useTranslation/useTranslation";
import { TranslateContext } from "../../../services/translationContext/translation.context";

const ComboLanguage = () => {
  const { language, changeLanguageHandler } = useContext(TranslateContext);

  const translate = useTranslation();

  const changeLanguage = (event) => {
    changeLanguageHandler(event.target.value);
  };

  return (
    <Form.Select
      onChange={changeLanguage}
      value={language}
      aria-label="Select Language"
      style={{ maxWidth: "150px" }}  
      className="w-25 mb-4"
    >
      <option value="es">{translate("spanish_lang")}</option>
      <option value="en">{translate("english_lang")}</option>
    </Form.Select>
  );
};

export default ComboLanguage;
