import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SecondaryButton } from "../ui";

type DoneItem = {
  id: string;
  title: string;
  doneAt?: number;
};

type DayDetailSectionProps = {
  selectedDay: Date;
  showDayPanel: boolean;
  selectedDone: DoneItem[];
  labels: {
    completedOn: string;
    hideDay: string;
    showDay: string;
    nothingDone: string;
    futureSelf: string;
    markUndone: string;
  };
  onToggleDayPanel: () => void;
  onMarkUndone: (todoId: string) => void;
};

export function DayDetailSection({
  selectedDay,
  showDayPanel,
  selectedDone,
  labels,
  onToggleDayPanel,
  onMarkUndone,
}: DayDetailSectionProps) {
  return (
    <section
      id="section-day-detail"
      data-role="container-panel"
      className="min-h-0 overflow-y-auto rounded-3xl border bg-[var(--card)] p-[var(--cardP)] shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div id="day-detail-toolbar" data-role="container-toolbar" className="mb-3 flex items-center justify-between">
        <h2 id="day-detail-title" className="text-sm font-semibold">
          {labels.completedOn}: {selectedDay.toLocaleDateString()}
        </h2>
        <SecondaryButton id="btn-day-detail-toggle" onClick={onToggleDayPanel}>
          {showDayPanel ? labels.hideDay : labels.showDay}
        </SecondaryButton>
      </div>
      <AnimatePresence initial={false}>
        {showDayPanel && (
          <motion.div
            id="day-detail-content"
            data-role="container-collapsible"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {selectedDone.length === 0 ? (
              <p id="day-detail-empty" data-role="day-item-empty" className="text-sm text-[var(--muted)]">
                {labels.nothingDone} {labels.futureSelf}
              </p>
            ) : (
              <div id="day-detail-list" data-role="container-list" className="space-y-2">
                {selectedDone.map((todo) => (
                  <div
                    id={`done-item-${todo.id}`}
                    data-role="day-item"
                    key={todo.id}
                    className="flex items-center justify-between rounded-xl border bg-[var(--card2)] px-3 py-2"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div id={`done-item-main-${todo.id}`} data-role="day-item-main" className="min-w-0">
                      <p id={`done-item-title-${todo.id}`} className="truncate text-sm">{todo.title}</p>
                      <p id={`done-item-time-${todo.id}`} className="text-xs text-[var(--muted)]">
                        {new Date(todo.doneAt ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <SecondaryButton id={`btn-mark-undone-${todo.id}`} onClick={() => onMarkUndone(todo.id)}>{labels.markUndone}</SecondaryButton>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
