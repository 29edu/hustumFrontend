import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export const FONT_OPTIONS = {
  system: {
    label: "System UI",
    value: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  inter: { label: "Inter", value: '"Inter", sans-serif' },
  poppins: { label: "Poppins", value: '"Poppins", sans-serif' },
  roboto: { label: "Roboto", value: '"Roboto", sans-serif' },
  nunito: { label: "Nunito", value: '"Nunito", sans-serif' },
  mono: { label: "Mono", value: '"JetBrains Mono", "Fira Code", monospace' },
};

export const FONT_SIZE_OPTIONS = {
  sm: { label: "S", px: "13px" },
  md: { label: "M", px: "15px" },
  lg: { label: "L", px: "16px" },
  xl: { label: "XL", px: "18px" },
};

export const ACCENT_OPTIONS = {
  blue: {
    label: "Blue",
    main: "#3b82f6",
    hover: "#2563eb",
    light: "rgba(59,130,246,0.12)",
    ring: "#bfdbfe",
    darkLight: "rgba(59,130,246,0.18)",
  },
  purple: {
    label: "Purple",
    main: "#8b5cf6",
    hover: "#7c3aed",
    light: "rgba(139,92,246,0.1)",
    ring: "#ddd6fe",
    darkLight: "rgba(139,92,246,0.18)",
  },
  green: {
    label: "Green",
    main: "#10b981",
    hover: "#059669",
    light: "rgba(16,185,129,0.1)",
    ring: "#a7f3d0",
    darkLight: "rgba(16,185,129,0.18)",
  },
  orange: {
    label: "Orange",
    main: "#f59e0b",
    hover: "#d97706",
    light: "rgba(245,158,11,0.1)",
    ring: "#fde68a",
    darkLight: "rgba(245,158,11,0.18)",
  },
  rose: {
    label: "Rose",
    main: "#f43f5e",
    hover: "#e11d48",
    light: "rgba(244,63,94,0.1)",
    ring: "#fecdd3",
    darkLight: "rgba(244,63,94,0.18)",
  },
  cyan: {
    label: "Cyan",
    main: "#06b6d4",
    hover: "#0891b2",
    light: "rgba(6,182,212,0.1)",
    ring: "#a5f3fc",
    darkLight: "rgba(6,182,212,0.18)",
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const [font, setFont] = useState(
    () => localStorage.getItem("font") || "system",
  );
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem("fontSize") || "md",
  );
  const [accentColor, setAccentColor] = useState(
    () => localStorage.getItem("accentColor") || "blue",
  );
  const [compact, setCompact] = useState(
    () => localStorage.getItem("compact") === "true",
  );
  const [glassEffect, setGlassEffect] = useState(
    () => localStorage.getItem("glassEffect") !== "false",
  );
  const [animationSpeed, setAnimationSpeed] = useState(
    () => localStorage.getItem("animationSpeed") || "normal",
  );

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Font family
  useEffect(() => {
    const f = FONT_OPTIONS[font]?.value || FONT_OPTIONS.system.value;
    document.documentElement.style.setProperty("--font-family", f);
    document.body.style.fontFamily = f;
    localStorage.setItem("font", font);
  }, [font]);

  // Font size
  useEffect(() => {
    const px = FONT_SIZE_OPTIONS[fontSize]?.px || "15px";
    document.documentElement.style.setProperty("--font-size-base", px);
    document.documentElement.style.fontSize = px;
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  // Accent color
  useEffect(() => {
    const a = ACCENT_OPTIONS[accentColor] || ACCENT_OPTIONS.blue;
    document.documentElement.style.setProperty("--accent", a.main);
    document.documentElement.style.setProperty("--accent-hover", a.hover);
    document.documentElement.style.setProperty("--accent-light", a.light);
    document.documentElement.style.setProperty(
      "--accent-light-dark",
      a.darkLight,
    );
    document.documentElement.style.setProperty("--ring", a.ring);
    localStorage.setItem("accentColor", accentColor);
  }, [accentColor]);

  // Compact mode
  useEffect(() => {
    document.documentElement.classList.toggle("compact", compact);
    localStorage.setItem("compact", String(compact));
  }, [compact]);

  // Glass effect
  useEffect(() => {
    document.documentElement.classList.toggle("no-glass", !glassEffect);
    localStorage.setItem("glassEffect", String(glassEffect));
  }, [glassEffect]);

  // Animation speed
  useEffect(() => {
    const speeds = { off: "0s", fast: "0.1s", normal: "0.25s", slow: "0.5s" };
    document.documentElement.style.setProperty(
      "--transition-speed",
      speeds[animationSpeed] || "0.25s",
    );
    localStorage.setItem("animationSpeed", animationSpeed);
  }, [animationSpeed]);

  const toggleTheme = () => setIsDark((p) => !p);
  const toggleCompact = () => setCompact((p) => !p);
  const toggleGlass = () => setGlassEffect((p) => !p);

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        font,
        setFont,
        fontSize,
        setFontSize,
        accentColor,
        setAccentColor,
        compact,
        toggleCompact,
        glassEffect,
        toggleGlass,
        animationSpeed,
        setAnimationSpeed,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
