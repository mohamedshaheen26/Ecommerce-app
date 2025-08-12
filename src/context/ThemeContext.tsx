import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { themes } from "../styles/themes";

interface ThemeContextType {
  currentTheme: string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  darkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  darkMode: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
      }
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      return systemPrefersDark ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useLayoutEffect(() => {
    // Apply CSS variables and Tailwind dark mode class before paint
    const root = document.documentElement;
    const themeColors = themes[currentTheme as keyof typeof themes];

    Object.entries(themeColors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    if (currentTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [currentTheme]);

  useEffect(() => {
    // Save theme preference
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  const setTheme = (theme: string) => {
    setCurrentTheme(theme);
  };

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        toggleTheme,
        darkMode: currentTheme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
