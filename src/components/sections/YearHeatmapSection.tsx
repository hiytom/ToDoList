import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton, cls } from "../ui";
import { addDays, ymd } from "../../lib/date";

type DayTodo = {
  id: string;
  title: string;
  createdAt: number;
  doneAt?: number;
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
  const accentRgb = useMemo(() => hexToRgb(heatColor), [heatColor]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const cellGap = 2;
  const rowLabelWidth = 18;
  const heatmapOffset = rowLabelWidth + 8;

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
  const usableWidth = useMemo(() => Math.max(320, availableWidth - heatmapOffset), [availableWidth, heatmapOffset]);
  const cellSize = useMemo(() => {
    if (!availableWidth) return 7;
    return Math.max(7, (usableWidth - (weeks.length - 1) * cellGap) / weeks.length);
  }, [availableWidth, usableWidth, weeks.length]);
  const gridWidth = usableWidth;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateWidth = () => {
      setAvailableWidth(element.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="section-year-heatmap"
      data-role="container-panel"
      className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent"
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            {lang === "en" ? `${totalDone} completions in ${year}` : `${year} 年完成 ${totalDone} 项`}
          </h2>
          <p className="text-[10px] text-[var(--muted)]">{labels.yearView}</p>
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

      <div ref={containerRef} className="min-h-0 flex-1 overflow-hidden">
        <div className="w-full">
          <div
            className="relative mb-1 h-4 text-[10px] text-[var(--muted)]"
            style={{ marginLeft: `${heatmapOffset}px`, width: `${gridWidth}px` }}
          >
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

          <div className="flex gap-[6px]">
            <div className="grid shrink-0 grid-rows-7 items-center text-[10px] text-[var(--muted)]">
              {Array.from({ length: 7 }, (_, row) => (
                <div key={row} className="flex items-center" style={{ height: `${cellSize}px`, marginBottom: row === 6 ? 0 : `${cellGap}px`, width: `${rowLabelWidth}px` }}>
                  {dayRows.includes(row) ? dayLabels[dayRows.indexOf(row)] : ""}
                </div>
              ))}
            </div>

            <div className="relative flex" style={{ gap: `${cellGap}px`, width: `${gridWidth}px` }}>
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
                        className={cls("rounded-[3px] border", isCurrentYear ? "" : "pointer-events-none opacity-0", isFuture && "opacity-60")}
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                          borderColor: level === 0 ? "var(--border)" : `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${opacity + 0.08})`,
                          background,
                        }}
                        onClick={() => {
                          onSelectDay(date);
                          onChangeMonthByDay(date);
                        }}
                      />
                    );
                  })}
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between gap-3 text-[10px] text-[var(--muted)]">
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
