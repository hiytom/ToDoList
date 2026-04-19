import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cls, SecondaryButton } from "./ui";

type MonthPickerModalProps = {
  show: boolean;
  pickerYear: number;
  monthCursor: Date;
  monthLabels: string[];
  closeLabel: string;
  onClose: () => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  onPickMonth: (monthIndex: number) => void;
};

export function MonthPickerModal({
  show,
  pickerYear,
  monthCursor,
  monthLabels,
  closeLabel,
  onClose,
  onPrevYear,
  onNextYear,
  onPickMonth,
}: MonthPickerModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          id="calendar-month-picker-backdrop"
          data-role="container-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={onClose}
        >
          <motion.div
            id="calendar-month-picker-panel"
            data-role="container-modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="w-full max-w-sm rounded-xl border bg-[var(--card)] p-3 shadow-lg"
            style={{ borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div id="calendar-month-picker-header" data-role="month-picker-header" className="mb-3 flex items-center justify-between">
              <SecondaryButton id="btn-calendar-year-prev" onClick={onPrevYear}>◀</SecondaryButton>
              <div id="calendar-month-picker-year" data-role="month-picker-year" className="text-sm font-semibold">{pickerYear}</div>
              <SecondaryButton id="btn-calendar-year-next" onClick={onNextYear}>▶</SecondaryButton>
            </div>

            <div id="calendar-month-picker-grid" data-role="month-picker-grid" className="grid grid-cols-3 gap-2">
              {monthLabels.map((label, idx) => {
                const active = monthCursor.getFullYear() === pickerYear && monthCursor.getMonth() === idx;
                return (
                  <button
                    id={`btn-picker-month-${idx + 1}`}
                    data-role="month-picker-option"
                    key={idx}
                    onClick={() => onPickMonth(idx)}
                    className={cls(
                      "rounded-lg px-2 py-2 text-sm transition-colors",
                      active ? "ring-2" : "ring-1"
                    )}
                    style={{
                      background: active ? "var(--accentSoft)" : "var(--card2)",
                      ringColor: active ? "var(--accentRing)" : "var(--border)",
                    } as React.CSSProperties}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div id="calendar-month-picker-actions" data-role="month-picker-actions" className="mt-3 flex justify-end">
              <SecondaryButton id="btn-calendar-month-picker-close" onClick={onClose}>{closeLabel}</SecondaryButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
