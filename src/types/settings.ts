import type { Lang } from "../lib/i18n";
import type { ThemeName } from "../lib/theme";

export type AppSettings = {
  lang: Lang;
  theme: ThemeName;
  dark: boolean;
  compact: boolean;
  showDayPanel: boolean;
  demoDismissed: boolean;
};
