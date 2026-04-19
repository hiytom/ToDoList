import type { CSSProperties } from "react";

type ThemeCssVars = CSSProperties & Record<`--${string}`, string>;

export type ThemeName =
  | "mint"
  | "indigo"
  | "amber"
  | "rose"
  | "slate"
  | "ocean"
  | "teal"
  | "sky"
  | "violet"
  | "fuchsia"
  | "coral"
  | "lime";

type ThemeTokens = {
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentSoftHover: string;
  accentRing: string;
};

export const themes: Record<ThemeName, ThemeTokens> = {
  mint: {
    accent: "#16A34A",
    accentHover: "#22C55E",
    accentSoft: "rgba(34, 197, 94, 0.12)",
    accentSoftHover: "rgba(34, 197, 94, 0.18)",
    accentRing: "rgba(34, 197, 94, 0.45)",
  },
  indigo: {
    accent: "#4F46E5",
    accentHover: "#6366F1",
    accentSoft: "rgba(99, 102, 241, 0.12)",
    accentSoftHover: "rgba(99, 102, 241, 0.18)",
    accentRing: "rgba(99, 102, 241, 0.45)",
  },
  amber: {
    accent: "#D97706",
    accentHover: "#F59E0B",
    accentSoft: "rgba(245, 158, 11, 0.14)",
    accentSoftHover: "rgba(245, 158, 11, 0.22)",
    accentRing: "rgba(245, 158, 11, 0.45)",
  },
  rose: {
    accent: "#E11D48",
    accentHover: "#FB7185",
    accentSoft: "rgba(251, 113, 133, 0.14)",
    accentSoftHover: "rgba(251, 113, 133, 0.22)",
    accentRing: "rgba(251, 113, 133, 0.45)",
  },
  slate: {
    accent: "#0F172A",
    accentHover: "#1F2937",
    accentSoft: "rgba(15, 23, 42, 0.08)",
    accentSoftHover: "rgba(15, 23, 42, 0.12)",
    accentRing: "rgba(15, 23, 42, 0.35)",
  },
  ocean: {
    accent: "#0EA5E9",
    accentHover: "#38BDF8",
    accentSoft: "rgba(56, 189, 248, 0.12)",
    accentSoftHover: "rgba(56, 189, 248, 0.2)",
    accentRing: "rgba(56, 189, 248, 0.45)",
  },
  teal: {
    accent: "#0F766E",
    accentHover: "#14B8A6",
    accentSoft: "rgba(20, 184, 166, 0.12)",
    accentSoftHover: "rgba(20, 184, 166, 0.2)",
    accentRing: "rgba(20, 184, 166, 0.45)",
  },
  sky: {
    accent: "#0284C7",
    accentHover: "#0EA5E9",
    accentSoft: "rgba(14, 165, 233, 0.12)",
    accentSoftHover: "rgba(14, 165, 233, 0.2)",
    accentRing: "rgba(14, 165, 233, 0.45)",
  },
  violet: {
    accent: "#7C3AED",
    accentHover: "#8B5CF6",
    accentSoft: "rgba(139, 92, 246, 0.12)",
    accentSoftHover: "rgba(139, 92, 246, 0.2)",
    accentRing: "rgba(139, 92, 246, 0.45)",
  },
  fuchsia: {
    accent: "#C026D3",
    accentHover: "#D946EF",
    accentSoft: "rgba(217, 70, 239, 0.12)",
    accentSoftHover: "rgba(217, 70, 239, 0.2)",
    accentRing: "rgba(217, 70, 239, 0.45)",
  },
  coral: {
    accent: "#EA580C",
    accentHover: "#F97316",
    accentSoft: "rgba(249, 115, 22, 0.12)",
    accentSoftHover: "rgba(249, 115, 22, 0.2)",
    accentRing: "rgba(249, 115, 22, 0.45)",
  },
  lime: {
    accent: "#65A30D",
    accentHover: "#84CC16",
    accentSoft: "rgba(132, 204, 22, 0.14)",
    accentSoftHover: "rgba(132, 204, 22, 0.22)",
    accentRing: "rgba(132, 204, 22, 0.45)",
  },
};

export function themeVars(theme: ThemeName, dark: boolean, compact: boolean): ThemeCssVars {
  const tk = themes[theme];

  const light = {
    "--bg": "#FAFAFA",
    "--fg": "#0A0A0A",
    "--muted": "#525252",
    "--muted2": "#737373",
    "--card": "#FFFFFF",
    "--card2": "#FAFAFA",
    "--border": "rgba(10, 10, 10, 0.10)",
    "--border2": "rgba(10, 10, 10, 0.14)",
  } as const;

  const darkSet = {
    "--bg": "#0B0F14",
    "--fg": "#F5F5F5",
    "--muted": "rgba(245,245,245,0.70)",
    "--muted2": "rgba(245,245,245,0.55)",
    "--card": "#0F1720",
    "--card2": "#0B0F14",
    "--border": "rgba(255,255,255,0.10)",
    "--border2": "rgba(255,255,255,0.14)",
  } as const;

  const density = compact
    ? {
        "--pagePX": "20px",
        "--pagePY": "14px",
        "--gap": "12px",
        "--cardP": "16px",
        "--btnX": "10px",
        "--btnY": "6px",
        "--icon": "16px",
        "--cellH5": "56px",
        "--cellH6": "46px",
      }
    : {
        "--pagePX": "24px",
        "--pagePY": "16px",
        "--gap": "16px",
        "--cardP": "20px",
        "--btnX": "12px",
        "--btnY": "8px",
        "--icon": "18px",
        "--cellH5": "62px",
        "--cellH6": "50px",
      };

  const base = dark ? darkSet : light;

  return {
    ...base,
    ...density,
    "--accent": tk.accent,
    "--accentHover": tk.accentHover,
    "--accentSoft": tk.accentSoft,
    "--accentSoftHover": tk.accentSoftHover,
    "--accentRing": tk.accentRing,
  };
}
