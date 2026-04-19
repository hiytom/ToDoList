import { addDays, clampToDay, doneAtForDate, startOfMonth, ymd } from "./date";
import { i18n, type I18nKey, weekdayEn, weekdayZh } from "./i18n";
import { themes } from "./theme";

export function runSelfTests() {
  const keys: I18nKey[] = [
    "appTitle",
    "appSubtitle",
    "today",
    "hideDay",
    "showDay",
    "create",
    "createHint",
    "undo",
    "add",
    "pending",
    "doneMonth",
    "noPending",
    "placeholder",
    "clickToComplete",
    "created",
    "monthTipChip",
    "calendarTodayChip",
    "tipPrefix",
    "tipSuffixEn",
    "tipSuffixZh",
    "demo",
    "completedOn",
    "nothingDone",
    "futureSelf",
    "markUndone",
    "interactionSummary",
    "summary1",
    "summary2",
    "summary3",
    "footer",
    "monthPicker",
    "year",
    "close",
    "theme",
    "darkMode",
    "density",
    "compact",
    "comfortable",
    "dragHint",
  ];

  for (const lg of ["en", "zh"] as const) {
    for (const k of keys) {
      console.assert(typeof i18n[lg][k] === "string", `Missing i18n ${lg}.${k}`);
      console.assert(!i18n[lg][k].includes("{t("), `i18n must not contain template calls: ${lg}.${k}`);
    }
  }

  console.assert(Array.isArray(weekdayEn) && weekdayEn.length === 7, "weekdayEn must be 7 days");
  console.assert(Array.isArray(weekdayZh) && weekdayZh.length === 7, "weekdayZh must be 7 days");

  const names = Object.keys(themes);
  console.assert(names.length >= 3, "Expected >= 3 themes");

  const d = new Date(2026, 1, 1);
  console.assert(ymd(d) === "2026-02-01", "ymd() should be YYYY-MM-DD");
  const m = startOfMonth(new Date(2026, 5, 18));
  console.assert(m.getDate() === 1, "startOfMonth should return day 1");
  console.assert(m.getMonth() === 5, "startOfMonth should keep month");

  const dd = addDays(new Date(2026, 1, 1), 10);
  console.assert(ymd(dd) === "2026-02-11", "addDays() should move forward");

  const c = clampToDay(new Date(2026, 1, 1, 23, 59, 59));
  console.assert(c.getHours() === 0 && c.getMinutes() === 0, "clampToDay() should clear time");

  const sel = new Date(2026, 2, 9);
  const ts = doneAtForDate(sel);
  console.assert(ymd(new Date(ts)) === ymd(sel), "doneAtForDate should keep same day");
}
