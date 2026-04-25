import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAnimationControls } from "framer-motion";
import {
  Moon,
  Palette,
  Sun,
} from "lucide-react";
import { ThemePickerModal } from "./components/ThemePickerModal";
import { cls, IconButton, SecondaryButton } from "./components/ui";
import { CalendarSection } from "./components/sections/CalendarSection";
import { DayDetailSection } from "./components/sections/DayDetailSection";
import { TodoSection } from "./components/sections/TodoSection";
import { YearHeatmapSection } from "./components/sections/YearHeatmapSection";
import { addDays, clampToDay, isAfterDay, isSameDay, startOfMonth, ymd } from "./lib/date";
import { t, type Lang, weekdayEn, weekdayZh } from "./lib/i18n";
import { runSelfTests } from "./lib/selfTests";
import { loadPersistedSettings, persistSettings } from "./lib/storage";
import { themeVars, themes, type ThemeName } from "./lib/theme";
import { useTodoData } from "./hooks/useTodoData";
import type { AppSettings } from "./types/settings";

const GHOST_HEIGHT = 48; // fixed macOS-style drag preview height
const DRAG_THRESHOLD = 6;

export default function App() {
  const today = useMemo(() => clampToDay(new Date()), []);
  const [lang, setLang] = useState<Lang>("zh");
  const [theme, setTheme] = useState<ThemeName>("mint");
  const [dark, setDark] = useState(false);
  const [compact, setCompact] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const [heatmapYear, setHeatmapYear] = useState(today.getFullYear());
  const [monthCursor, setMonthCursor] = useState(startOfMonth(today));
  const [selectedDay, setSelectedDay] = useState(today);
  const [dragTodoId, setDragTodoId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [dragGhost, setDragGhost] = useState<{ title: string; x: number; y: number } | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showDemoAction, setShowDemoAction] = useState(true);
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);
  const [addFeedbackToken, setAddFeedbackToken] = useState(0);
  const addFeedbackTimerRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ id: string; title: string; startX: number; startY: number } | null>(null);
  const suppressClickRef = useRef<string | null>(null);
  const controls = useAnimationControls();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    runSelfTests();
  }, []);

  useEffect(() => {
    let cancelled = false;

    void loadPersistedSettings().then((settings) => {
      if (cancelled) return;
      setLang(settings.lang);
      setTheme(settings.theme);
      setDark(settings.dark);
      setCompact(settings.compact);
      setShowDemoAction(!settings.demoDismissed);
      setHeatmapYear(today.getFullYear());
      setHasLoadedSettings(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const dragStart = dragStartRef.current;
      if (!dragStart) return;

      const deltaX = event.clientX - dragStart.startX;
      const deltaY = event.clientY - dragStart.startY;
      const movedEnough = Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD;

      if (!dragTodoId && movedEnough) {
        setDragTodoId(dragStart.id);
        setDragGhost({
          title: dragStart.title,
          x: event.clientX + 16,
          y: event.clientY + 18,
        });
        suppressClickRef.current = dragStart.id;
        return;
      }

      if (dragTodoId) {
        setDragGhost({
          title: dragStart.title,
          x: event.clientX + 16,
          y: event.clientY + 18,
        });
      }
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      setDragTodoId(null);
      setDragOverDay(null);
      setDragGhost(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragTodoId]);

  const cssVars = useMemo(() => themeVars(theme, dark, compact), [theme, dark, compact]);
  const persistedSettings = useMemo<AppSettings>(
    () => ({
      lang,
      theme,
      dark,
      compact,
      showDayPanel: true,
      demoDismissed: !showDemoAction,
    }),
    [lang, theme, dark, compact, showDemoAction]
  );

  useEffect(() => {
    if (!hasLoadedSettings) return;
    void persistSettings(persistedSettings);
  }, [hasLoadedSettings, persistedSettings]);

  const pickerMonthLabels = useMemo(
    () =>
      Array.from({ length: 12 }, (_, m) =>
        new Date(pickerYear, m, 1).toLocaleDateString(lang === "en" ? "en-US" : "zh-CN", {
          month: "short",
        })
      ),
    [pickerYear, lang]
  );

  const {
    title,
    setTitle,
    pending,
    doneMap,
    monthDoneCount,
    selectedDone,
    createTodo,
    updateDone,
    markUndone,
    updateTodoTitle,
    deleteTodo,
    demoCompleteFirst,
  } = useTodoData({ today, monthCursor, selectedDay, controls, listRef });

  const weekday = lang === "en" ? weekdayEn : weekdayZh;
  const monthStart = startOfMonth(monthCursor);
  const monthEnd = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
  const leading = monthStart.getDay();
  const totalCells = (leading + monthEnd.getDate() <= 35 ? 35 : 42) as 35 | 42;
  const gridStart = addDays(monthStart, -leading);
  const dayCells = useMemo(() => {
    return Array.from({ length: totalCells }, (_, i) => addDays(gridStart, i));
  }, [gridStart, totalCells]);

  function openMonthPicker() {
    setPickerYear(monthCursor.getFullYear());
    setShowMonthPicker(true);
  }

  function pickMonth(monthIndex: number) {
    setMonthCursor(new Date(pickerYear, monthIndex, 1));
    setShowMonthPicker(false);
  }

  function startEditing(todo: { id: string; title: string }) {
    setEditingTodoId(todo.id);
    setEditingTitle(todo.title);
  }

  function cancelEditing() {
    setEditingTodoId(null);
    setEditingTitle("");
  }

  function saveEditing() {
    if (!editingTodoId) return;
    const ok = updateTodoTitle(editingTodoId, editingTitle);
    if (ok) cancelEditing();
  }

  function removeTodo(todoId: string) {
    deleteTodo(todoId);
    if (editingTodoId === todoId) cancelEditing();
    if (dragTodoId === todoId) {
      dragStartRef.current = null;
      setDragTodoId(null);
      setDragOverDay(null);
      setDragGhost(null);
    }
  }

  return (
    <div
      id="app-root"
      data-role="container-app"
      style={cssVars}
      className={cls(
        "h-screen overflow-hidden bg-[var(--bg)] text-[var(--fg)] antialiased selection:bg-[var(--accentSoft)]",
        dragTodoId && "select-none cursor-grabbing"
      )}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: dark
            ? "radial-gradient(circle at top, rgba(255,255,255,0.05), transparent 44%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 28%)"
            : "radial-gradient(circle at top, rgba(255,255,255,0.96), rgba(255,255,255,0.72) 34%, transparent 62%), linear-gradient(180deg, rgba(255,255,255,0.68), rgba(255,255,255,0.32))",
        }}
      />
      <div
        id="layout-page"
        data-role="container-layout"
        className="relative flex h-full w-full"
      >
        <div
          className="flex h-full min-h-0 w-full flex-col overflow-hidden"
          style={{
            background: dark ? "rgba(11, 15, 20, 0.94)" : "rgba(252, 252, 250, 0.96)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            id="window-titlebar"
            data-role="container-window-titlebar"
            className="flex h-14 flex-none items-center border-b px-6"
            style={{
              WebkitAppRegion: "drag",
              borderColor: "var(--border)",
              background: dark ? "rgba(9,13,18,0.96)" : "rgba(248,248,246,0.96)",
            } as React.CSSProperties}
          >
            <div className="h-full w-full pl-16" />
          </div>

          <header
            id="header-main"
            data-role="container-header"
            className="flex flex-none items-center justify-between gap-3 border-b px-6 py-4"
            style={{
              borderColor: "var(--border)",
              background: dark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.54)",
            } as React.CSSProperties}
          >
            <div id="header-title-group" data-role="container-header-group" className="min-w-0">
              <h1 id="header-title" className="text-[22px] font-semibold tracking-tight">{t(lang, "appTitle")}</h1>
              <p id="header-subtitle" className="text-sm text-[var(--muted)]">{t(lang, "appSubtitle")}</p>
            </div>

            <div
              id="header-controls"
              data-role="container-header-group"
              className="flex items-center gap-2"
              style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
            >
              <SecondaryButton id="btn-lang-toggle" onClick={() => setLang((v) => (v === "en" ? "zh" : "en"))}>
                {lang.toUpperCase()}
              </SecondaryButton>
              <IconButton id="btn-theme-toggle" onClick={() => setShowThemePicker((v) => !v)}>
                <Palette size={16} />
              </IconButton>
              <SecondaryButton
                id="btn-settings-toggle"
                className="inline-flex items-center gap-1 whitespace-nowrap"
                onClick={() => setDark((v) => !v)}
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
                <span id="label-settings-toggle" className="ml-1">{t(lang, "darkMode")}</span>
              </SecondaryButton>
            </div>
          </header>

          <ThemePickerModal
            show={showThemePicker}
            title={t(lang, "theme")}
            closeLabel={t(lang, "close")}
            currentTheme={theme}
            themes={themes}
            onClose={() => setShowThemePicker(false)}
            onSelectTheme={(name) => {
              setTheme(name as ThemeName);
              setShowThemePicker(false);
            }}
          />

          <div
            id="workspace-layout"
            data-role="container-workspace"
            className="grid min-h-0 flex-1 grid-cols-[320px_547px_minmax(360px,1fr)]"
          >
            <div className="min-h-0 border-r px-4 py-4" style={{ borderColor: "var(--border)" }}>
              <TodoSection
                controls={controls}
                pending={pending}
                monthDoneCount={monthDoneCount}
                showDemoAction={showDemoAction}
                title={title}
                listRef={listRef}
                ghostHeight={GHOST_HEIGHT}
                labels={{
                  pending: t(lang, "pending"),
                  doneMonth: t(lang, "doneMonth"),
                  demo: t(lang, "demo"),
                  placeholder: t(lang, "placeholder"),
                  add: t(lang, "add"),
                  noPending: t(lang, "noPending"),
                  created: t(lang, "created"),
                  edit: t(lang, "edit"),
                  delete: t(lang, "delete"),
                  save: t(lang, "save"),
                  cancel: t(lang, "cancel"),
                  addedSuccess: t(lang, "addedSuccess"),
                }}
                dragActiveTodoId={dragTodoId}
                onTitleChange={setTitle}
                addFeedbackToken={addFeedbackToken}
                onCreateTodo={async () => {
                  const created = await createTodo();
                  if (created) {
                    const token = Date.now();
                    setAddFeedbackToken(token);
                    if (addFeedbackTimerRef.current) {
                      window.clearTimeout(addFeedbackTimerRef.current);
                    }
                    addFeedbackTimerRef.current = window.setTimeout(() => {
                      setAddFeedbackToken(0);
                      addFeedbackTimerRef.current = null;
                    }, 1200);
                  }
                }}
                onDemoCompleteFirst={async () => {
                  await demoCompleteFirst();
                  setShowDemoAction(false);
                }}
                editingTodoId={editingTodoId}
                editingTitle={editingTitle}
                onEditingTitleChange={setEditingTitle}
                onStartEditing={startEditing}
                onSaveEditing={saveEditing}
                onCancelEditing={cancelEditing}
                onDeleteTodo={removeTodo}
                onPendingPointerStart={(todo, event) => {
                  if (event.button !== 0) return;
                  dragStartRef.current = {
                    id: todo.id,
                    title: todo.title,
                    startX: event.clientX,
                    startY: event.clientY,
                  };
                }}
                onPendingClick={(todoId) => {
                  if (suppressClickRef.current === todoId) {
                    suppressClickRef.current = null;
                    return;
                  }
                  updateDone(todoId, today);
                }}
              />
            </div>

            <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_220px] border-r" style={{ borderColor: "var(--border)" }}>
              <div className="min-h-0 px-4 py-4">
                <CalendarSection
                  lang={lang}
                  heatColor={themes[theme].accent}
                  monthCursor={monthCursor}
                  selectedDay={selectedDay}
                  today={today}
                  monthEnd={monthEnd}
                  weekday={weekday}
                  dayCells={dayCells}
                  totalCells={totalCells}
                  doneMap={doneMap}
                  dragTodoId={dragTodoId}
                  dragOverDay={dragOverDay}
                  showMonthPicker={showMonthPicker}
                  pickerYear={pickerYear}
                  pickerMonthLabels={pickerMonthLabels}
                  labels={{
                    today: t(lang, "today"),
                    monthPicker: t(lang, "monthPicker"),
                    close: t(lang, "close"),
                    calendarTodayChip: t(lang, "calendarTodayChip"),
                    tipPrefix: t(lang, "tipPrefix"),
                    tipSuffixEn: t(lang, "tipSuffixEn"),
                    tipSuffixZh: t(lang, "tipSuffixZh"),
                  }}
                  ymd={ymd}
                  isSameDay={isSameDay}
                  isAfterDay={isAfterDay}
                  onSetMonthToday={() => setMonthCursor(startOfMonth(today))}
                  onSetMonthPrev={() => setMonthCursor(addDays(monthStart, -1 * 28))}
                  onSetMonthNext={() => setMonthCursor(addDays(monthStart, 35))}
                  onOpenMonthPicker={openMonthPicker}
                  onCloseMonthPicker={() => setShowMonthPicker(false)}
                  onPrevPickerYear={() => setPickerYear((y) => y - 1)}
                  onNextPickerYear={() => setPickerYear((y) => y + 1)}
                  onPickMonth={pickMonth}
                  onSelectDay={setSelectedDay}
                  onChangeMonthByDay={(d) => setMonthCursor(startOfMonth(d))}
                  onHoverDay={setDragOverDay}
                  onLeaveHoverDay={(key) => {
                    if (dragOverDay === key) setDragOverDay(null);
                  }}
                  onReleaseDay={(d, isFuture) => {
                    if (isFuture) {
                      setDragTodoId(null);
                      setDragOverDay(null);
                      return;
                    }
                    const id = dragTodoId;
                    if (!id) return;
                    updateDone(id, d);
                    setSelectedDay(d);
                    dragStartRef.current = null;
                    setDragTodoId(null);
                    setDragOverDay(null);
                    setDragGhost(null);
                  }}
                  onDragOverDay={setDragOverDay}
                  onDragLeaveDay={(key) => {
                    if (dragOverDay === key) setDragOverDay(null);
                  }}
                  onDropDay={(d) => {
                    const id = dragTodoId;
                    if (!id) return;
                    updateDone(id, d);
                    setSelectedDay(d);
                    dragStartRef.current = null;
                    setDragTodoId(null);
                    setDragOverDay(null);
                    setDragGhost(null);
                  }}
                  onRejectFutureDrop={() => {
                    dragStartRef.current = null;
                    setDragTodoId(null);
                    setDragOverDay(null);
                    setDragGhost(null);
                  }}
                />
              </div>

              <div className="min-h-0 border-t px-4 py-4" style={{ borderColor: "var(--border)" }}>
                <YearHeatmapSection
                  lang={lang}
                  year={heatmapYear}
                  today={today}
                  doneMap={doneMap}
                  heatColor={themes[theme].accent}
                  onSelectDay={(date) => {
                    setSelectedDay(date);
                    setMonthCursor(startOfMonth(date));
                  }}
                  onChangeMonthByDay={(date) => setMonthCursor(startOfMonth(date))}
                  onChangeYear={setHeatmapYear}
                  labels={{
                    yearView: t(lang, "yearView"),
                    completedCount: t(lang, "completedCount"),
                    less: t(lang, "less"),
                    more: t(lang, "more"),
                  }}
                />
              </div>
            </div>

            <div className="min-h-0 px-4 py-4">
              <DayDetailSection
                selectedDay={selectedDay}
                selectedDone={selectedDone}
                labels={{
                  completedOn: t(lang, "completedOn"),
                  nothingDone: t(lang, "nothingDone"),
                  futureSelf: t(lang, "futureSelf"),
                  markUndone: t(lang, "markUndone"),
                  edit: t(lang, "edit"),
                  delete: t(lang, "delete"),
                  save: t(lang, "save"),
                  cancel: t(lang, "cancel"),
                }}
                editingTodoId={editingTodoId}
                editingTitle={editingTitle}
                onEditingTitleChange={setEditingTitle}
                onStartEditing={startEditing}
                onSaveEditing={saveEditing}
                onCancelEditing={cancelEditing}
                onDeleteTodo={removeTodo}
                onMarkUndone={markUndone}
              />
            </div>

          </div>
        </div>
      </div>
      {dragGhost && (
        <div
          id="todo-drag-ghost"
          data-role="drag-ghost"
          className="pointer-events-none fixed left-0 top-0 z-50 w-[280px] rounded-2xl border bg-[var(--card)]/95 px-3 py-2 shadow-2xl backdrop-blur-sm"
          style={{
            borderColor: "var(--border)",
            transform: `translate(${dragGhost.x}px, ${dragGhost.y}px) rotate(-2deg)`,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
            <p className="truncate text-sm font-medium">{dragGhost.title}</p>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">{t(lang, "dragHint")}</p>
        </div>
      )}
    </div>
  );
}
