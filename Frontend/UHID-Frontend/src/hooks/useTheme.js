import { useEffect } from "react";

export default function useTheme(theme) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
}