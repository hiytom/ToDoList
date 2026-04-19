import React from "react";
import { AnimatePresence, motion, type AnimationControls } from "framer-motion";
import { Circle, Plus, Undo2 } from "lucide-react";
import { Chip, PrimaryButton, SecondaryButton, cls } from "../ui";

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
  undoEnabled: boolean;
  title: string;
  listRef: React.RefObject<HTMLDivElement | null>;
  ghostHeight: number;
  labels: {
    pending: string;
    doneMonth: string;
    undo: string;
    demo: string;
    placeholder: string;
    add: string;
    noPending: string;
    created: string;
    dragHint: string;
  };
  onTitleChange: (value: string) => void;
  onCreateTodo: () => void;
  onUndoLast: () => void;
  onDemoCompleteFirst: () => void;
  onPendingDragStart: (e: React.DragEvent<HTMLDivElement>, todoId: string) => void;
  onPendingDragEnd: () => void;
  onPendingClick: (todoId: string) => void;
};

export function TodoSection({
  controls,
  pending,
  monthDoneCount,
  undoEnabled,
  title,
  listRef,
  ghostHeight,
  labels,
  onTitleChange,
  onCreateTodo,
  onUndoLast,
  onDemoCompleteFirst,
  onPendingDragStart,
  onPendingDragEnd,
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
          <Chip id="chip-pending" dataRole="stat-chip">{labels.pending}: {pending.length}</Chip>
          <Chip id="chip-month-done" dataRole="stat-chip">{labels.doneMonth}: {monthDoneCount}</Chip>
        </div>
        <div id="todo-actions" data-role="container-group" className="flex items-center gap-2">
          <SecondaryButton
            id="btn-undo"
            className="inline-flex items-center gap-1 whitespace-nowrap"
            disabled={!undoEnabled}
            onClick={onUndoLast}
          >
            <Undo2 size={16} /> {labels.undo}
          </SecondaryButton>
          <SecondaryButton id="btn-demo-complete" onClick={onDemoCompleteFirst}>{labels.demo}</SecondaryButton>
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
          <div id="todo-input-actions" data-role="container-actions" className="mt-3 flex justify-end">
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
                draggable
                onDragStart={(e) => onPendingDragStart(e, todo.id)}
                onDragEnd={onPendingDragEnd}
                className={cls(
                  "mb-2 flex cursor-pointer items-center justify-between rounded-xl border px-3",
                  "bg-[var(--card)] hover:bg-[var(--accentSoft)] transition-colors"
                )}
                style={{ borderColor: "var(--border)", minHeight: `${ghostHeight}px` }}
                onClick={() => onPendingClick(todo.id)}
              >
                <div id={`pending-item-main-${todo.id}`} data-role="pending-item-main" className="flex min-w-0 items-center gap-2 py-2">
                  <Circle size={16} className="shrink-0 text-[var(--muted)]" />
                  <div id={`pending-item-text-${todo.id}`} data-role="pending-item-text" className="min-w-0">
                    <p id={`pending-item-title-${todo.id}`} className="truncate text-sm">{todo.title}</p>
                    <p id={`pending-item-created-${todo.id}`} className="text-xs text-[var(--muted)]">
                      {labels.created}: {new Date(todo.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Chip id={`pending-item-chip-${todo.id}`} dataRole="pending-item-chip">{labels.dragHint}</Chip>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
