import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { themes } from "../styles/themes";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  currentTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  darkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: "system",
  setTheme: () => {},
  toggleTheme: () => {},
  darkMode: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem("theme") as ThemeMode) || "system";
    } catch {
      return "system";
    }
  });

  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
    getSystemTheme()
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const appliedTheme = currentTheme === "system" ? systemTheme : currentTheme;

  useLayoutEffect(() => {
    const root = document.documentElement;
    const themeColors = themes[appliedTheme];

    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.classList.toggle("dark", appliedTheme === "dark");
  }, [appliedTheme]);

  useEffect(() => {
    if (currentTheme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => setCurrentTheme("system");

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme: setCurrentTheme,
        toggleTheme,
        darkMode: appliedTheme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
