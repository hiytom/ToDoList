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
import { addDays, clampToDay, isAfterDay, isSameDay, startOfMonth, ymd } from "./lib/date";
import { t, type Lang, weekdayEn, weekdayZh } from "./lib/i18n";
import { runSelfTests } from "./lib/selfTests";
import { loadPersistedSettings, persistSettings } from "./lib/storage";
import { themeVars, themes, type ThemeName } from "./lib/theme";
import { useTodoData } from "./hooks/useTodoData";
import type { AppSettings } from "./types/settings";

const GHOST_HEIGHT = 48; // fixed macOS-style drag preview height

export default function App() {
  const today = useMemo(() => clampToDay(new Date()), []);
  const [lang, setLang] = useState<Lang>("zh");
  const [theme, setTheme] = useState<ThemeName>("mint");
  const [dark, setDark] = useState(false);
  const [compact, setCompact] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const [showDayPanel, setShowDayPanel] = useState(true);
  const [monthCursor, setMonthCursor] = useState(startOfMonth(today));
  const [selectedDay, setSelectedDay] = useState(today);
  const [dragTodoId, setDragTodoId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showDemoAction, setShowDemoAction] = useState(true);
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);
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
      setShowDayPanel(settings.showDayPanel);
      setShowDemoAction(!settings.demoDismissed);
      setHasLoadedSettings(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!dragTodoId) return;
    const stopDragging = () => {
      setDragTodoId(null);
      setDragOverDay(null);
    };
    window.addEventListener("mouseup", stopDragging);
    return () => {
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [dragTodoId]);

  const cssVars = useMemo(() => themeVars(theme, dark, compact), [theme, dark, compact]);
  const persistedSettings = useMemo<AppSettings>(
    () => ({
      lang,
      theme,
      dark,
      compact,
      showDayPanel,
      demoDismissed: !showDemoAction,
    }),
    [lang, theme, dark, compact, showDayPanel, showDemoAction]
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
    undoAction,
    pending,
    doneMap,
    monthDoneCount,
    selectedDone,
    createTodo,
    updateDone,
    markUndone,
    updateTodoTitle,
    deleteTodo,
    undoLast,
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
      setDragTodoId(null);
      setDragOverDay(null);
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
        id="layout-page"
        data-role="container-layout"
        className="mx-auto flex h-full max-w-6xl flex-col px-[var(--pagePX)] py-[var(--pagePY)]"
        style={{ gap: "var(--gap)" }}
      >
        <header
          id="header-main"
          data-role="container-header"
          className="mb-4 flex flex-wrap items-center justify-between gap-3"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >
          <div id="header-title-group" data-role="container-header-group">
            <h1 id="header-title" className="text-2xl font-semibold tracking-tight">{t(lang, "appTitle")}</h1>
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

        <TodoSection
          controls={controls}
          pending={pending}
          monthDoneCount={monthDoneCount}
          undoEnabled={!!undoAction}
          showDemoAction={showDemoAction}
          title={title}
          listRef={listRef}
          ghostHeight={GHOST_HEIGHT}
          labels={{
            pending: t(lang, "pending"),
            doneMonth: t(lang, "doneMonth"),
            undo: t(lang, "undo"),
            demo: t(lang, "demo"),
            placeholder: t(lang, "placeholder"),
            add: t(lang, "add"),
            noPending: t(lang, "noPending"),
            created: t(lang, "created"),
            dragHint: t(lang, "dragHint"),
            edit: t(lang, "edit"),
            delete: t(lang, "delete"),
            save: t(lang, "save"),
            cancel: t(lang, "cancel"),
            dragToDate: t(lang, "dragToDate"),
          }}
          onTitleChange={setTitle}
          onCreateTodo={createTodo}
          onUndoLast={undoLast}
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
          onPendingPointerStart={(todoId) => {
            setDragTodoId(todoId);
          }}
          onPendingClick={(todoId) => updateDone(todoId, today)}
        />

        <div
          id="calendar-detail-layout"
          data-role="container-split-layout"
          className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
        >
          <CalendarSection
            lang={lang}
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
              setDragTodoId(null);
              setDragOverDay(null);
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
              setDragTodoId(null);
              setDragOverDay(null);
            }}
            onRejectFutureDrop={() => {
              setDragTodoId(null);
              setDragOverDay(null);
            }}
          />

          <DayDetailSection
            selectedDay={selectedDay}
            showDayPanel={showDayPanel}
            selectedDone={selectedDone}
            labels={{
              completedOn: t(lang, "completedOn"),
              hideDay: t(lang, "hideDay"),
              showDay: t(lang, "showDay"),
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
            onToggleDayPanel={() => setShowDayPanel((v) => !v)}
            onMarkUndone={markUndone}
          />
        </div>
      </div>
    </div>
  );
}
