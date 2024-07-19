import React, { useContext } from "react";
import { Dropdown } from "react-bootstrap";
import useTranslation from "../../../custom/useTranslation/useTranslation";
import { TranslateContext } from "../../../services/translationContext/translation.context";

const ComboLanguage = () => {
  const { language, changeLanguageHandler } = useContext(TranslateContext);

  const translate = useTranslation();

  const changeLanguage = (eventKey) => {
    changeLanguageHandler(eventKey);
  };

  return (
    <Dropdown onSelect={changeLanguage} style={{ marginRight: "16px" }}>
      <Dropdown.Toggle variant="primary" id="dropdown-basic">
        {language === "es"
          ? translate("spanish_lang")
          : translate("english_lang")}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item eventKey="es">{translate("spanish_lang")}</Dropdown.Item>
        <Dropdown.Item eventKey="en">{translate("english_lang")}</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ComboLanguage;
