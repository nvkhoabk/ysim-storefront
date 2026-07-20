export const designTokens = {
  colors: {
    brand: {
      50: "#effaf4",
      100: "#dcf5e7",
      200: "#bce9cf",
      300: "#8ed8ae",
      400: "#58bf87",
      500: "#2fa66a",
      600: "#178653",
      700: "#0f6b43",
      800: "#0d5638",
      900: "#0b472f",
      950: "#05281b",
    },
    semantic: {
      background: "#ffffff",
      surface: "#ffffff",
      surfaceSubtle: "#f7faf8",
      surfaceHighlighted: "#effaf4",
      text: "#10231a",
      textMuted: "#5e6f66",
      border: "#dfe8e2",
      danger: "#c93636",
    },
  },
  radius: {
    sm: "0.625rem",
    md: "0.875rem",
    lg: "1.125rem",
    xl: "1.5rem",
    pill: "999px",
  },
  motion: {
    fast: "140ms",
    normal: "220ms",
    slow: "360ms",
  },
  containers: {
    content: "80rem",
    wide: "90rem",
    full: "100%",
  },
} as const;

export type DesignTokens = typeof designTokens;
