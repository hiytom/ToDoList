import React from "react";
import { AnimatePresence, motion, type AnimationControls } from "framer-motion";
import { Check, Circle, Pencil, Plus, Trash2, X } from "lucide-react";
import { IconButton, PrimaryButton, SecondaryButton, cls } from "../ui";

type TodoItem = {
  id: string;
  title: string;
  createdAt: number;
  doneAt?: number;
};

type TodoSectionProps = {
  controls: AnimationControls;
  pending: TodoItem[];
  monthDoneCount: number;
  showDemoAction: boolean;
  addFeedbackToken: number;
  title: string;
  listRef: React.RefObject<HTMLDivElement>;
  ghostHeight: number;
  labels: {
    pending: string;
    doneMonth: string;
    demo: string;
    placeholder: string;
    add: string;
    noPending: string;
    created: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    addedSuccess: string;
  };
  dragActiveTodoId: string | null;
  onTitleChange: (value: string) => void;
  onCreateTodo: () => void;
  onDemoCompleteFirst: () => void;
  editingTodoId: string | null;
  editingTitle: string;
  onEditingTitleChange: (value: string) => void;
  onStartEditing: (todo: TodoItem) => void;
  onSaveEditing: () => void;
  onCancelEditing: () => void;
  onDeleteTodo: (todoId: string) => void;
  onPendingPointerStart: (todo: TodoItem, event: React.MouseEvent<HTMLDivElement>) => void;
  onPendingClick: (todoId: string) => void;
};

export function TodoSection({
  controls,
  pending,
  monthDoneCount,
  showDemoAction,
  addFeedbackToken,
  title,
  listRef,
  ghostHeight,
  labels,
  dragActiveTodoId,
  onTitleChange,
  onCreateTodo,
  onDemoCompleteFirst,
  editingTodoId,
  editingTitle,
  onEditingTitleChange,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
  onDeleteTodo,
  onPendingPointerStart,
  onPendingClick,
}: TodoSectionProps) {
  return (
    <motion.section
      id="section-todo"
      data-role="container-panel"
      animate={controls}
      className="mb-4 shrink-0 rounded-3xl border bg-[var(--card)] p-[var(--cardP)] shadow-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div id="todo-toolbar" data-role="container-toolbar" className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div id="todo-stats" data-role="container-group" className="flex items-center gap-2">
          <span id="chip-pending" data-role="stat-chip" className="inline-flex items-center rounded-full bg-[var(--card2)] px-2 py-1 text-xs text-[var(--muted)] ring-1 ring-[var(--border)]">
            {labels.pending}: {pending.length}
          </span>
          <span id="chip-month-done" data-role="stat-chip" className="inline-flex items-center rounded-full bg-[var(--card2)] px-2 py-1 text-xs text-[var(--muted)] ring-1 ring-[var(--border)]">
            {labels.doneMonth}: {monthDoneCount}
          </span>
        </div>
        <div id="todo-actions" data-role="container-group" className="flex items-center gap-2">
          {showDemoAction && (
            <SecondaryButton id="btn-demo-complete" onClick={onDemoCompleteFirst}>{labels.demo}</SecondaryButton>
          )}
        </div>
      </div>

      <div id="todo-split-layout" data-role="container-split-layout" className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div id="todo-input-panel" data-role="container-input-panel" className="flex h-44 flex-col rounded-2xl border bg-[var(--card2)] p-3" style={{ borderColor: "var(--border)" }}>
          <textarea
            id="input-todo-title"
            data-role="todo-input"
            className="w-full flex-1 resize-none rounded-xl border bg-[var(--card)] px-3 py-2 outline-none"
            style={{ borderColor: "var(--border2)" }}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={labels.placeholder}
          />
          <div id="todo-input-actions" data-role="container-actions" className="mt-3 flex items-center justify-end gap-2">
            <AnimatePresence mode="wait">
              {addFeedbackToken > 0 && (
                <motion.div
                  key={addFeedbackToken}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.24 }}
                  className="rounded-full bg-[var(--accentSoft)] px-2.5 py-1 text-xs text-[var(--fg)]"
                >
                  {labels.addedSuccess}
                </motion.div>
              )}
            </AnimatePresence>
            <PrimaryButton id="btn-add-todo" onClick={onCreateTodo}>
              <Plus size={16} />
              {labels.add}
            </PrimaryButton>
          </div>
        </div>

        <div
          id="todo-pending-list"
          data-role="container-list"
          ref={listRef}
          className="h-44 overflow-y-auto rounded-2xl border bg-[var(--card2)] p-2"
          style={{ borderColor: "var(--border)" }}
        >
          <AnimatePresence initial={false}>
            {pending.length === 0 && (
              <motion.div
                id="todo-empty-state"
                data-role="pending-item-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 text-sm text-[var(--muted)]"
              >
                {labels.noPending}
              </motion.div>
            )}

            {pending.map((todo) => (
              <motion.div
                id={`pending-item-${todo.id}`}
                data-role="pending-item"
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={cls(
                  "mb-2 flex cursor-default items-center justify-between rounded-xl border px-3 transition-all",
                  "bg-[var(--card)] hover:bg-[var(--accentSoft)]",
                  dragActiveTodoId === todo.id && "scale-[0.985] opacity-40"
                )}
                style={{ borderColor: "var(--border)", minHeight: `${ghostHeight}px` }}
                onMouseDown={(e) => {
                  if (editingTodoId === todo.id) return;
                  onPendingPointerStart(todo, e);
                }}
                onClick={() => {
                  if (editingTodoId === todo.id) return;
                  onPendingClick(todo.id);
                }}
              >
                <div id={`pending-item-main-${todo.id}`} data-role="pending-item-main" className="flex min-w-0 items-center gap-2 py-2">
                  <Circle size={16} className="shrink-0 text-[var(--muted)]" />
                  <div id={`pending-item-text-${todo.id}`} data-role="pending-item-text" className="min-w-0">
                    {editingTodoId === todo.id ? (
                      <div className="flex min-w-0 flex-col gap-2">
                        <input
                          id={`pending-item-edit-${todo.id}`}
                          value={editingTitle}
                          onChange={(e) => onEditingTitleChange(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") onSaveEditing();
                            if (e.key === "Escape") onCancelEditing();
                          }}
                          className="w-full rounded-lg border bg-[var(--card2)] px-2 py-1 text-sm outline-none"
                          style={{ borderColor: "var(--border2)" }}
                          autoFocus
                        />
                        <div className="flex items-center gap-1">
                          <IconButton
                            id={`btn-save-edit-${todo.id}`}
                            title={labels.save}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSaveEditing();
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <Check size={15} />
                          </IconButton>
                          <IconButton
                            id={`btn-cancel-edit-${todo.id}`}
                            title={labels.cancel}
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancelEditing();
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <X size={15} />
                          </IconButton>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p id={`pending-item-title-${todo.id}`} className="truncate text-sm">{todo.title}</p>
                        <p id={`pending-item-created-${todo.id}`} className="text-xs text-[var(--muted)]">
                          {labels.created}: {new Date(todo.createdAt).toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-1">
                  <IconButton
                    id={`btn-edit-pending-${todo.id}`}
                    title={labels.edit}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEditing(todo);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Pencil size={15} />
                  </IconButton>
                  <IconButton
                    id={`btn-delete-pending-${todo.id}`}
                    title={labels.delete}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTodo(todo.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
