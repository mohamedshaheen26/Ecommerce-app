import ComputerIcon from "@mui/icons-material/Computer";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";

const THEMES = {
  light: "Light Mode",
  dark: "Dark Mode",
  system: "System",
} as const;

type ThemeMode = keyof typeof THEMES;

const ThemeMenu = () => {
  const { currentTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const THEME_KEYS = Object.keys(THEMES) as ThemeMode[];

  const getThemeIcon = () => {
    if (currentTheme === "dark") return <DarkModeIcon fontSize='small' />;
    if (currentTheme === "light") return <LightModeIcon fontSize='small' />;
    return <ComputerIcon fontSize='small' />;
  };

  return (
    <>
      <button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className='flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] cursor-pointer m-0'
      >
        <span className='text-sm'>{getThemeIcon()}</span>

        {/* Arrow */}
        <KeyboardArrowDownIcon
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          fontSize='small'
        />
      </button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-secondary)",
          },
        }}
      >
        {THEME_KEYS.map((theme) => (
          <MenuItem
            key={theme}
            selected={theme === currentTheme}
            onClick={() => {
              setTheme(theme);
              setAnchorEl(null);
            }}
            sx={{
              "&.Mui-selected": {
                backgroundColor: "var(--accent-primary)",
                color: "var(--text-primary)",
              },
              "&.Mui-selected:hover": {
                backgroundColor: "var(--accent-primary)",
                color: "var(--text-primary)",
              },
              "&:hover": {
                backgroundColor: "var(--accent-hover)",
                color: "var(--text-primary)",
              },
            }}
          >
            {t(theme)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ThemeMenu;
