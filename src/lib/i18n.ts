export type Lang = "en" | "zh";

export type I18nKey =
  | "appTitle"
  | "appSubtitle"
  | "today"
  | "hideDay"
  | "showDay"
  | "create"
  | "createHint"
  | "undo"
  | "add"
  | "pending"
  | "doneMonth"
  | "noPending"
  | "placeholder"
  | "clickToComplete"
  | "created"
  | "monthTipChip"
  | "calendarTodayChip"
  | "tipPrefix"
  | "tipSuffixEn"
  | "tipSuffixZh"
  | "demo"
  | "completedOn"
  | "nothingDone"
  | "futureSelf"
  | "markUndone"
  | "interactionSummary"
  | "summary1"
  | "summary2"
  | "summary3"
  | "footer"
  | "monthPicker"
  | "year"
  | "close"
  | "theme"
  | "darkMode"
  | "density"
  | "compact"
  | "comfortable"
  | "dragHint";

export const weekdayEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const weekdayZh = ["日", "一", "二", "三", "四", "五", "六"];

export const i18n: Record<Lang, Record<I18nKey, string>> = {
  en: {
    appTitle: "Todo + Calendar",
    appSubtitle: "Click once to complete → shows on the calendar",
    today: "Today",
    hideDay: "Hide day",
    showDay: "Show day",
    create: "Create",
    createHint: "Press Enter to add. Click a task to mark done.",
    undo: "Undo",
    add: "Add",
    pending: "Pending",
    doneMonth: "Done (month)",
    noPending: "No pending tasks. Go touch grass 🌿",
    placeholder: 'e.g. "Send new apron photos"',
    clickToComplete: "Click to complete",
    created: "Created",
    monthTipChip: "Tip: drag a pending item onto a date to backdate completion",
    calendarTodayChip: "Today",
    tipPrefix: "Tip: complete a task up top → it will appear on",
    tipSuffixEn: " if done today.",
    tipSuffixZh: "",
    demo: "Demo: complete first pending",
    completedOn: "Completed on",
    nothingDone: "Nothing completed on this day.",
    futureSelf: "(Your future self is judging you softly.)",
    markUndone: "Mark undone",
    interactionSummary: "Interaction summary",
    summary1: "Create tasks in the top panel.",
    summary2: "Click once to complete; it lands on today’s date.",
    summary3: "Drag a pending item onto a date to complete on that date.",
    footer:
      "Prototype only. Next steps: replace state with SQLite + add tags, search, and keyboard shortcuts (⌘N / ⌘K).",
    monthPicker: "Jump to month",
    year: "Year",
    close: "Close",
    theme: "Theme",
    darkMode: "Dark",
    density: "Density",
    compact: "Compact",
    comfortable: "Comfort",
    dragHint: "Drag onto a date",
  },
  zh: {
    appTitle: "待办 + 日历",
    appSubtitle: "点一下完成 → 自动落到日历当天",
    today: "今天",
    hideDay: "收起详情",
    showDay: "展开详情",
    create: "创建",
    createHint: "回车添加；点一下任务=完成。",
    undo: "撤销",
    add: "添加",
    pending: "待办",
    doneMonth: "本月已完成",
    noPending: "没有待办了，去喝口水 😌",
    placeholder: "例如：\"拍一组新图\"",
    clickToComplete: "点一下完成",
    created: "创建于",
    monthTipChip: "提示：把待办拖到某天，可补记为那天完成",
    calendarTodayChip: "今天",
    tipPrefix: "提示：在上面点完成 → 会出现在",
    tipSuffixEn: "",
    tipSuffixZh: "（若今天完成）",
    demo: "演示：完成第一条待办",
    completedOn: "完成于",
    nothingDone: "这天没有完成记录。",
    futureSelf: "（未来的你正在默默鼓掌/摇头）",
    markUndone: "设为未完成",
    interactionSummary: "交互说明",
    summary1: "在上方创建待办。",
    summary2: "点一下完成；自动落到当天。",
    summary3: "把待办拖到日期上，即可记录为那天完成。",
    footer: "这是原型。下一步：接 SQLite + 标签/搜索 + 快捷键（⌘N / ⌘K）。",
    monthPicker: "快速跳转月份",
    year: "年份",
    close: "关闭",
    theme: "主题",
    darkMode: "夜间",
    density: "密度",
    compact: "紧凑",
    comfortable: "舒适",
    dragHint: "拖到日期上",
  },
};

export function t(lang: Lang, key: I18nKey) {
  return i18n[lang][key];
}
