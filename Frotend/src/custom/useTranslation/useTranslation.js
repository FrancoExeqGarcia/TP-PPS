import { useContext } from "react";

import { dictionary_translations } from "./translation.dictionary";
import { TranslateContext } from "../../services/translationContext/translation.context";

const useTranslation = () => {
  const { language } = useContext(TranslateContext);

  return (key) => {
    const translation = dictionary_translations[language]
      ? dictionary_translations[language].find((t) => t.key === key)?.value
      : dictionary_translations["en"].find((t) => t.key === key)?.value;

    return translation || key;
  };
};

export default useTranslation;
