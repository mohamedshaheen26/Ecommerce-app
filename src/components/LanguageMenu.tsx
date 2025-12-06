import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { useLanguage } from "../context/LanguageContext";

const LANGS = {
  en: { label: "English", countryCode: "US" },
  ar: { label: "العربية", countryCode: "EG" },
} as const;

type LangKey = keyof typeof LANGS;

const LanguageMenu = () => {
  const { currentLang, changeLanguage } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className='flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] cursor-pointer m-0'
      >
        <ReactCountryFlag
          svg
          countryCode={LANGS[currentLang as LangKey].countryCode}
          style={{ width: "1em", height: "1em" }}
        />
        <span className='text-sm'>{LANGS[currentLang as LangKey].label}</span>

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
        {Object.entries(LANGS).map(([key, lang]) => (
          <MenuItem
            key={key}
            selected={key === currentLang}
            onClick={() => {
              changeLanguage(key);
              setAnchorEl(null);
            }}
            className='flex gap-2'
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
            <ReactCountryFlag
              svg
              countryCode={lang.countryCode}
              style={{ width: "1.5em", height: "1.1em" }}
            />
            {lang.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageMenu;
