import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton, cls } from "../ui";
import { addDays, ymd } from "../../lib/date";

type DayTodo = {
  id: string;
  title: string;
  createdAt: number;
  doneAt?: number;
};

type HoveredCell = {
  date: Date;
  count: number;
  titles: string[];
};

type YearHeatmapSectionProps = {
  lang: "en" | "zh";
  year: number;
  today: Date;
  doneMap: Map<string, DayTodo[]>;
  heatColor: string;
  onSelectDay: (date: Date) => void;
  onChangeMonthByDay: (date: Date) => void;
  onChangeYear: (year: number) => void;
  labels: {
    yearView: string;
    completedCount: string;
    less: string;
    more: string;
  };
};

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const expanded = normalized.length === 3
    ? normalized.split("").map((part) => `${part}${part}`).join("")
    : normalized;
  const value = Number.parseInt(expanded, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function heatLevel(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export function YearHeatmapSection({
  lang,
  year,
  today,
  doneMap,
  heatColor,
  onSelectDay,
  onChangeMonthByDay,
  onChangeYear,
  labels,
}: YearHeatmapSectionProps) {
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);
  const accentRgb = useMemo(() => hexToRgb(heatColor), [heatColor]);
  const cellSize = 12;
  const cellGap = 4;
  const rowLabelWidth = 48;

  const { weeks, monthMarkers, totalDone } = useMemo(() => {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    const gridStart = addDays(yearStart, -yearStart.getDay());
    const gridEnd = addDays(yearEnd, 6 - yearEnd.getDay());

    const dates: Date[] = [];
    for (let d = new Date(gridStart); d <= gridEnd; d = addDays(d, 1)) {
      dates.push(new Date(d));
    }

    const builtWeeks: Date[][] = [];
    for (let i = 0; i < dates.length; i += 7) {
      builtWeeks.push(dates.slice(i, i + 7));
    }

    const markers = Array.from({ length: 12 }, (_, monthIndex) => {
      const monthDate = new Date(year, monthIndex, 1);
      const daysOffset = Math.floor((monthDate.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24));
      return {
        label: monthDate.toLocaleDateString(lang === "en" ? "en-US" : "zh-CN", { month: "short" }),
        weekIndex: Math.floor(daysOffset / 7),
      };
    }).filter((marker, index, all) => index === 0 || marker.weekIndex !== all[index - 1].weekIndex);

    let doneCount = 0;
    for (const [key, todos] of doneMap.entries()) {
      if (key.startsWith(`${year}-`)) {
        doneCount += todos.length;
      }
    }

    return { weeks: builtWeeks, monthMarkers: markers, totalDone: doneCount };
  }, [doneMap, lang, year]);

  const legendStops = [0, 1, 2, 3, 4];
  const dayLabels = lang === "en" ? ["Sun", "Tue", "Thu"] : ["日", "二", "四"];
  const dayRows = [0, 2, 4];
  const gridWidth = weeks.length * cellSize + Math.max(0, weeks.length - 1) * cellGap;

  return (
    <section
      id="section-year-heatmap"
      data-role="container-panel"
      className="shrink-0 rounded-3xl border bg-[var(--card)] p-[var(--cardP)] shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {lang === "en" ? `${totalDone} completions in ${year}` : `${year} 年完成 ${totalDone} 项`}
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">{labels.yearView}</p>
        </div>
        <div className="flex items-center gap-2">
          <IconButton id="btn-heatmap-prev-year" title={lang === "en" ? "Previous year" : "上一年"} onClick={() => onChangeYear(year - 1)}>
            <ChevronLeft size={16} />
          </IconButton>
          <span className="min-w-[64px] text-center text-sm font-medium">{year}</span>
          <IconButton id="btn-heatmap-next-year" title={lang === "en" ? "Next year" : "下一年"} onClick={() => onChangeYear(year + 1)}>
            <ChevronRight size={16} />
          </IconButton>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div style={{ minWidth: `${rowLabelWidth + 12 + gridWidth}px` }}>
          <div className="relative mb-2 ml-[60px] h-5 text-xs text-[var(--muted)]">
            {monthMarkers.map((marker) => (
              <div
                key={`${marker.label}-${marker.weekIndex}`}
                style={{ left: `${marker.weekIndex * (cellSize + cellGap)}px` }}
                className="absolute top-0 whitespace-nowrap"
              >
                {marker.label}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <div className="grid shrink-0 grid-rows-7 items-center text-xs text-[var(--muted)]">
              {Array.from({ length: 7 }, (_, row) => (
                <div key={row} className="flex h-3 items-center" style={{ marginBottom: row === 6 ? 0 : `${cellGap}px` }}>
                  {dayRows.includes(row) ? dayLabels[dayRows.indexOf(row)] : ""}
                </div>
              ))}
            </div>

            <div className="relative flex gap-1" style={{ gap: `${cellGap}px` }}>
              {weeks.map((week, weekIndex) => (
                <div key={`heatmap-week-${weekIndex}`} className="grid grid-rows-7" style={{ gap: `${cellGap}px` }}>
                  {week.map((date) => {
                    const key = ymd(date);
                    const todos = doneMap.get(key) ?? [];
                    const count = todos.length;
                    const level = heatLevel(count);
                    const isCurrentYear = date.getFullYear() === year;
                    const isFuture = date.getTime() > today.getTime();
                    const opacity = [0, 0.14, 0.24, 0.38, 0.56][level];
                    const background = isCurrentYear
                      ? level === 0
                        ? "var(--card2)"
                        : `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${opacity})`
                      : "transparent";

                    return (
                      <button
                        key={key}
                        type="button"
                        className={cls(
                          "rounded-[3px] border transition-transform hover:scale-110",
                          isCurrentYear ? "" : "pointer-events-none opacity-0",
                          isFuture && "opacity-60"
                        )}
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                          borderColor: level === 0 ? "var(--border)" : `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${opacity + 0.08})`,
                          background,
                        }}
                        onMouseEnter={() =>
                          setHoveredCell({
                            date,
                            count,
                            titles: todos.slice(0, 3).map((todo) => todo.title),
                          })}
                        onMouseLeave={() => setHoveredCell((current) => (current?.date.getTime() === date.getTime() ? null : current))}
                        onClick={() => {
                          onSelectDay(date);
                          onChangeMonthByDay(date);
                        }}
                      />
                    );
                  })}
                </div>
              ))}

              {hoveredCell && (
                <div
                  className="pointer-events-none absolute left-0 top-full z-20 mt-3 w-[240px] rounded-xl border bg-[var(--card)] px-3 py-2 text-xs shadow-xl"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="font-medium text-[var(--fg)]">{hoveredCell.date.toLocaleDateString()}</div>
                  <div className="mt-1 text-[var(--muted)]">
                    {hoveredCell.count} {labels.completedCount}
                  </div>
                  {hoveredCell.titles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {hoveredCell.titles.map((title) => (
                        <div key={title} className="truncate text-[var(--fg)]">
                          {title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
        <span>{lang === "en" ? "Activity intensity" : "完成强度"}</span>
        <div className="flex items-center gap-2">
          <span>{labels.less}</span>
          <div className="flex items-center gap-1">
            {legendStops.map((level) => {
              const opacity = [0, 0.14, 0.24, 0.38, 0.56][level];
              return (
                <span
                  key={`legend-${level}`}
                  className="h-3 w-3 rounded-[3px] border"
                  style={{
                    borderColor: level === 0 ? "var(--border)" : `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${opacity + 0.08})`,
                    background: level === 0 ? "var(--card2)" : `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${opacity})`,
                  }}
                />
              );
            })}
          </div>
          <span>{labels.more}</span>
        </div>
      </div>
    </section>
  );
}
