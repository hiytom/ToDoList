import React from "react";
import { Check, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import { IconButton } from "../ui";

type DoneItem = {
  id: string;
  title: string;
  doneAt?: number;
};

type DayDetailSectionProps = {
  selectedDay: Date;
  selectedDone: DoneItem[];
  labels: {
    completedOn: string;
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
  onMarkUndone: (todoId: string) => void;
};

export function DayDetailSection({
  selectedDay,
  selectedDone,
  labels,
  editingTodoId,
  editingTitle,
  onEditingTitleChange,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
  onDeleteTodo,
  onMarkUndone,
}: DayDetailSectionProps) {
  return (
    <section
      id="section-day-detail"
      data-role="container-panel"
      className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent"
    >
      <div id="day-detail-toolbar" data-role="container-toolbar" className="mb-2 flex items-center justify-between">
        <h2 id="day-detail-title" className="text-sm font-semibold">
          {labels.completedOn}: {selectedDay.toLocaleDateString()}
        </h2>
      </div>
      <div id="day-detail-content" data-role="container-collapsible" className="min-h-0 flex-1 overflow-y-auto pr-1">
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
                className="flex items-center justify-between border-b px-1 py-2"
                style={{ borderColor: "var(--border)" }}
              >
                <div id={`done-item-main-${todo.id}`} data-role="day-item-main" className="flex min-w-0 items-center">
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
                    <div className="group relative min-w-0">
                      <p id={`done-item-title-${todo.id}`} className="truncate text-sm">{todo.title}</p>
                      <div
                        className="pointer-events-none absolute left-0 top-full z-20 mt-1 hidden w-56 whitespace-normal break-words rounded-lg border bg-[var(--card)] px-2 py-1 text-xs text-[var(--fg)] shadow-lg group-hover:block"
                        style={{ borderColor: "var(--border)" }}
                      >
                        {todo.title}
                      </div>
                    </div>
                  )}
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-1">
                  <IconButton id={`btn-edit-done-${todo.id}`} title={labels.edit} onClick={() => onStartEditing(todo)}>
                    <Pencil size={15} />
                  </IconButton>
                  <IconButton id={`btn-delete-done-${todo.id}`} title={labels.delete} onClick={() => onDeleteTodo(todo.id)}>
                    <Trash2 size={15} />
                  </IconButton>
                  <IconButton id={`btn-mark-undone-${todo.id}`} title={labels.markUndone} onClick={() => onMarkUndone(todo.id)}>
                    <RotateCcw size={15} />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
