import { useContext } from "react";
import { Button } from "react-bootstrap";
import { ThemeContext } from "../../../services/themeContext/theme.context";
import useTranslation from "../../../custom/useTranslation/useTranslation";

const ToggleTheme = () => {
  const translate = useTranslation();

  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <Button
      className="ml-2 mt-2 mt-md-0"
      variant="secondary"
      onClick={toggleTheme}
    >
      {translate(
        theme === "oscuro" ? "light_theme_change" : "dark_theme_change"
      )}
    </Button>
  );
};

export default ToggleTheme;
