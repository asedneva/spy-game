import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={styles.wrapper}>
      <button style={styles.toggle} onClick={() => setOpen((prev) => !prev)} aria-label="Switch language">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8" />
          <path d="M3 12H21" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 3C15 6.2 15 17.8 12 21" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 3C9 6.2 9 17.8 12 21" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div style={styles.dropdown}>
          <button style={styles.option} onClick={() => { setLanguage("en"); setOpen(false); }}>
            <span>🇬🇧 {t("language.english")}</span>
            <span style={styles.check}>{language === "en" ? "✓" : ""}</span>
          </button>
          <button style={styles.option} onClick={() => { setLanguage("ru"); setOpen(false); }}>
            <span>🇷🇺 {t("language.russian")}</span>
            <span style={styles.check}>{language === "ru" ? "✓" : ""}</span>
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    top: "1rem",
    right: "1rem",
    zIndex: 1000,
  },
  toggle: {
    width: 42,
    height: 42,
    borderRadius: 10,
    border: "1px solid #2d2a42",
    background: "#1e1b2e",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdown: {
    marginTop: 8,
    minWidth: 170,
    background: "#1e1b2e",
    border: "1px solid #2d2a42",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.35)",
  },
  option: {
    width: "100%",
    background: "transparent",
    border: "none",
    color: "#f3f4f6",
    padding: "0.65rem 0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    fontSize: "0.95rem",
    textAlign: "left",
  },
  check: {
    color: "#7c3aed",
    fontWeight: 700,
    minWidth: 12,
    textAlign: "right",
  },
};
