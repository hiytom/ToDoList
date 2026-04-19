import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { IconButton, SecondaryButton } from "../ui";

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
    edit: string;
    delete: string;
    save: string;
    cancel: string;
  };
  editingTodoId: string | null;
  editingTitle: string;
  onEditingTitleChange: (value: string) => void;
  onStartEditing: (todo: Pick<DoneItem, "id" | "title">) => void;
  onSaveEditing: () => void;
  onCancelEditing: () => void;
  onDeleteTodo: (todoId: string) => void;
  onToggleDayPanel: () => void;
  onMarkUndone: (todoId: string) => void;
};

export function DayDetailSection({
  selectedDay,
  showDayPanel,
  selectedDone,
  labels,
  editingTodoId,
  editingTitle,
  onEditingTitleChange,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
  onDeleteTodo,
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
                      {editingTodoId === todo.id ? (
                        <div className="flex min-w-0 flex-col gap-2">
                          <input
                            id={`done-item-edit-${todo.id}`}
                            value={editingTitle}
                            onChange={(e) => onEditingTitleChange(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") onSaveEditing();
                              if (e.key === "Escape") onCancelEditing();
                            }}
                            className="w-full rounded-lg border bg-[var(--card)] px-2 py-1 text-sm outline-none"
                            style={{ borderColor: "var(--border2)" }}
                            autoFocus
                          />
                          <div className="flex items-center gap-1">
                            <IconButton id={`btn-save-done-${todo.id}`} title={labels.save} onClick={onSaveEditing}>
                              <Check size={15} />
                            </IconButton>
                            <IconButton id={`btn-cancel-done-${todo.id}`} title={labels.cancel} onClick={onCancelEditing}>
                              <X size={15} />
                            </IconButton>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p id={`done-item-title-${todo.id}`} className="truncate text-sm">{todo.title}</p>
                          <p id={`done-item-time-${todo.id}`} className="text-xs text-[var(--muted)]">
                            {new Date(todo.doneAt ?? 0).toLocaleString()}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-1">
                      <IconButton id={`btn-edit-done-${todo.id}`} title={labels.edit} onClick={() => onStartEditing(todo)}>
                        <Pencil size={15} />
                      </IconButton>
                      <IconButton id={`btn-delete-done-${todo.id}`} title={labels.delete} onClick={() => onDeleteTodo(todo.id)}>
                        <Trash2 size={15} />
                      </IconButton>
                      <SecondaryButton id={`btn-mark-undone-${todo.id}`} onClick={() => onMarkUndone(todo.id)}>{labels.markUndone}</SecondaryButton>
                    </div>
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
