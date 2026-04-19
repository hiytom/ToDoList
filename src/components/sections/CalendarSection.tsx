import React from "react";
import { Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { MonthPickerModal } from "../MonthPickerModal";
import { SecondaryButton, cls } from "../ui";

type DayTodo = {
  id: string;
  title: string;
  createdAt: number;
  doneAt?: number;
};

type CalendarSectionProps = {
  lang: "en" | "zh";
  monthCursor: Date;
  selectedDay: Date;
  today: Date;
  monthEnd: Date;
  weekday: string[];
  dayCells: Date[];
  totalCells: 35 | 42;
  doneMap: Map<string, DayTodo[]>;
  dragTodoId: string | null;
  dragOverDay: string | null;
  showMonthPicker: boolean;
  pickerYear: number;
  pickerMonthLabels: string[];
  labels: {
    today: string;
    monthPicker: string;
    close: string;
    calendarTodayChip: string;
    tipPrefix: string;
    tipSuffixEn: string;
    tipSuffixZh: string;
  };
  ymd: (d: Date) => string;
  isSameDay: (a: Date, b: Date) => boolean;
  isAfterDay: (a: Date, b: Date) => boolean;
  onSetMonthToday: () => void;
  onSetMonthPrev: () => void;
  onSetMonthNext: () => void;
  onOpenMonthPicker: () => void;
  onCloseMonthPicker: () => void;
  onPrevPickerYear: () => void;
  onNextPickerYear: () => void;
  onPickMonth: (monthIndex: number) => void;
  onSelectDay: (d: Date) => void;
  onChangeMonthByDay: (d: Date) => void;
  onDragOverDay: (key: string) => void;
  onDragLeaveDay: (key: string) => void;
  onDropDay: (d: Date) => void;
  onRejectFutureDrop: () => void;
};

export function CalendarSection({
  lang,
  monthCursor,
  selectedDay,
  today,
  monthEnd,
  weekday,
  dayCells,
  totalCells,
  doneMap,
  dragTodoId,
  dragOverDay,
  showMonthPicker,
  pickerYear,
  pickerMonthLabels,
  labels,
  ymd,
  isSameDay,
  isAfterDay,
  onSetMonthToday,
  onSetMonthPrev,
  onSetMonthNext,
  onOpenMonthPicker,
  onCloseMonthPicker,
  onPrevPickerYear,
  onNextPickerYear,
  onPickMonth,
  onSelectDay,
  onChangeMonthByDay,
  onDragOverDay,
  onDragLeaveDay,
  onDropDay,
  onRejectFutureDrop,
}: CalendarSectionProps) {
  return (
    <section
      id="section-calendar"
      data-role="container-panel"
      className="min-h-0 overflow-hidden rounded-3xl border bg-[var(--card)] p-[var(--cardP)] shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div id="calendar-toolbar" data-role="container-toolbar" className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div id="calendar-title-group" data-role="container-group" className="flex items-center gap-2 text-sm">
          <CalendarIcon size={16} />
          <span id="calendar-month-title" className="font-medium">
            {monthCursor.toLocaleDateString(lang === "en" ? "en-US" : "zh-CN", {
              year: "numeric",
              month: "long",
            })}
          </span>
        </div>
        <div id="calendar-controls" data-role="container-controls" className="flex items-center gap-2">
          <SecondaryButton id="btn-calendar-today" onClick={onSetMonthToday}>{labels.today}</SecondaryButton>
          <SecondaryButton id="btn-calendar-prev" onClick={onSetMonthPrev}>◀</SecondaryButton>
          <SecondaryButton id="btn-calendar-next" onClick={onSetMonthNext}>▶</SecondaryButton>
          <SecondaryButton id="btn-calendar-month-picker-toggle" onClick={onOpenMonthPicker}>{labels.monthPicker}</SecondaryButton>
        </div>
      </div>

      <MonthPickerModal
        show={showMonthPicker}
        pickerYear={pickerYear}
        monthCursor={monthCursor}
        monthLabels={pickerMonthLabels}
        closeLabel={labels.close}
        onClose={onCloseMonthPicker}
        onPrevYear={onPrevPickerYear}
        onNextYear={onNextPickerYear}
        onPickMonth={onPickMonth}
      />

      <div id="calendar-week-header" data-role="calendar-week-header" className="mb-2 grid grid-cols-7 gap-2">
        {weekday.map((w) => (
          <div id={`calendar-weekday-${w}`} data-role="calendar-weekday" key={w} className="px-1 text-xs text-[var(--muted)]">{w}</div>
        ))}
      </div>

      <div id="calendar-day-grid" data-role="calendar-grid" className="grid grid-cols-7 gap-2">
        {dayCells.map((d) => {
          const key = ymd(d);
          const inMonth = d.getMonth() === monthCursor.getMonth();
          const isToday = isSameDay(d, today);
          const isFuture = isAfterDay(d, today);
          const selected = isSameDay(d, selectedDay);
          const done = doneMap.get(key)?.length ?? 0;
          const isDragOver = dragOverDay === key && !!dragTodoId;
          return (
            <button
              id={`calendar-day-${key}`}
              data-role="calendar-day-cell"
              key={key}
              onClick={() => {
                onSelectDay(d);
                if (isAfterDay(d, monthEnd)) onChangeMonthByDay(d);
              }}
              onDragOver={(e) => {
                if (!dragTodoId) return;
                if (isFuture) return;
                e.preventDefault();
                onDragOverDay(key);
              }}
              onDragLeave={() => {
                onDragLeaveDay(key);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (isFuture) {
                  onRejectFutureDrop();
                  return;
                }
                onDropDay(d);
              }}
              className={cls(
                "group relative rounded-xl border p-1.5 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--card)]",
                inMonth ? "opacity-100" : "opacity-60",
                isToday ? "text-[var(--fg)]" : "",
                selected ? "shadow-[0_0_0_1px_var(--accent)]" : ""
              )}
              style={{
                borderColor: isDragOver ? "var(--accent)" : "var(--border)",
                minHeight: totalCells === 35 ? "var(--cellH5)" : "var(--cellH6)",
                background: isDragOver ? "var(--accentSoft)" : isToday ? "var(--accentSoft)" : "var(--card2)",
              } as React.CSSProperties}
            >
              <div id={`calendar-day-head-${key}`} data-role="calendar-day-head" className="flex items-center justify-between">
                <span id={`calendar-day-number-${key}`} className="text-xs">{d.getDate()}</span>
                {isToday && (
                  <span id={`calendar-day-today-${key}`} data-role="calendar-today-chip" className="rounded-full bg-white/40 px-1.5 py-0.5 text-[10px] text-[var(--fg)]">
                    {labels.calendarTodayChip}
                  </span>
                )}
              </div>
              {!!done && (
                <div id={`calendar-day-done-${key}`} data-role="calendar-done-chip" className="mt-2 inline-flex items-center gap-1 rounded-md bg-[var(--card)] px-1.5 py-0.5 text-[10px] text-[var(--fg)]">
                  <CheckCircle2 size={11} /> {done}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div id="calendar-tip" data-role="container-tip" className="mt-3 text-xs text-[var(--muted)]">
        {labels.tipPrefix} <strong id="calendar-tip-date">{selectedDay.toLocaleDateString()}</strong>
        {lang === "en" ? labels.tipSuffixEn : labels.tipSuffixZh}
      </div>
    </section>
  );
}
