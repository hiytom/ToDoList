import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cls, IconButton } from "./ui";

type ThemePickerModalProps = {
  show: boolean;
  title: string;
  closeLabel: string;
  currentTheme: string;
  themes: Record<string, { accent: string }>;
  onClose: () => void;
  onSelectTheme: (name: string) => void;
};

export function ThemePickerModal({
  show,
  title,
  closeLabel,
  currentTheme,
  themes,
  onClose,
  onSelectTheme,
}: ThemePickerModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          id="panel-theme-backdrop"
          data-role="container-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={onClose}
        >
          <motion.div
            id="panel-theme"
            data-role="container-modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="w-full max-w-sm rounded-2xl border bg-[var(--card)] p-3 shadow-lg"
            style={{ borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div id="panel-theme-header" data-role="container-flyout-header" className="mb-2 flex items-center justify-between">
              <span id="panel-theme-title" className="text-sm font-medium">{title}</span>
              <IconButton id="btn-theme-close" onClick={onClose} aria-label={closeLabel}>
                <X size={16} />
              </IconButton>
            </div>
            <div id="panel-theme-options" data-role="container-options" className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {Object.keys(themes).map((name) => (
                <button
                  id={`btn-theme-${name}`}
                  data-role="theme-option"
                  key={name}
                  onClick={() => onSelectTheme(name)}
                  aria-label={`theme ${name}`}
                  className={cls(
                    "h-9 w-9 rounded-full transition-transform hover:scale-105",
                    "focus:outline-none",
                    currentTheme === name ? "ring-2 ring-offset-2 ring-offset-[var(--card)]" : "ring-1"
                  )}
                  style={{
                    background: themes[name].accent,
                    ringColor: currentTheme === name ? "var(--accentRing)" : "var(--border)",
                  } as React.CSSProperties}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
