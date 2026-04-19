import { useMemo, useState, type RefObject } from "react";
import type { AnimationControls } from "framer-motion";
import { doneAtForDate, ymd } from "../lib/date";
import type { Todo, UndoAction } from "../types/todo";

type UseTodoDataArgs = {
  today: Date;
  monthCursor: Date;
  selectedDay: Date;
  controls: AnimationControls;
  listRef: RefObject<HTMLDivElement | null>;
};

export function useTodoData({ today, monthCursor, selectedDay, controls, listRef }: UseTodoDataArgs) {
  const [title, setTitle] = useState("");
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [todos, setTodos] = useState<Todo[]>(() => {
    const now = Date.now();
    return [
      { id: "t1", title: "Send supplier revision list", createdAt: now - 1000 * 60 * 45 },
      { id: "t2", title: "Collect UGC clips for campaign", createdAt: now - 1000 * 60 * 80 },
      {
        id: "t3",
        title: "Finalize product card copy",
        createdAt: now - 1000 * 60 * 180,
        doneAt: doneAtForDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)),
      },
    ];
  });

  const pending = useMemo(
    () => todos.filter((x) => !x.doneAt).sort((a, b) => b.createdAt - a.createdAt),
    [todos]
  );

  const doneMap = useMemo(() => {
    const m = new Map<string, Todo[]>();
    for (const todo of todos) {
      if (!todo.doneAt) continue;
      const key = ymd(new Date(todo.doneAt));
      const arr = m.get(key) ?? [];
      arr.push(todo);
      m.set(key, arr);
    }
    return m;
  }, [todos]);

  const monthDoneCount = useMemo(() => {
    let c = 0;
    for (const todo of todos) {
      if (!todo.doneAt) continue;
      const d = new Date(todo.doneAt);
      if (d.getFullYear() === monthCursor.getFullYear() && d.getMonth() === monthCursor.getMonth()) c += 1;
    }
    return c;
  }, [todos, monthCursor]);

  const selectedDone = useMemo(
    () => (doneMap.get(ymd(selectedDay)) ?? []).sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0)),
    [doneMap, selectedDay]
  );

  function createTodo() {
    const v = title.trim();
    if (!v) return;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
    setTodos((prev) => [{ id, title: v, createdAt: Date.now() }, ...prev]);
    setTitle("");
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function updateDone(todoId: string, date: Date) {
    const prev = todos.find((x) => x.id === todoId);
    if (!prev) return;
    setUndoAction({ todoId, prevDoneAt: prev.doneAt });
    setTodos((old) => old.map((x) => (x.id === todoId ? { ...x, doneAt: doneAtForDate(date) } : x)));
  }

  function markUndone(todoId: string) {
    const prev = todos.find((x) => x.id === todoId);
    if (!prev) return;
    setUndoAction({ todoId, prevDoneAt: prev.doneAt });
    setTodos((old) => old.map((x) => (x.id === todoId ? { ...x, doneAt: undefined } : x)));
  }

  function undoLast() {
    if (!undoAction) return;
    setTodos((old) => old.map((x) => (x.id === undoAction.todoId ? { ...x, doneAt: undoAction.prevDoneAt } : x)));
    setUndoAction(null);
  }

  async function demoCompleteFirst() {
    if (!pending.length) return;
    await controls.start({ scale: [1, 1.02, 1], transition: { duration: 0.28 } });
    updateDone(pending[0].id, today);
  }

  return {
    title,
    setTitle,
    undoAction,
    pending,
    doneMap,
    monthDoneCount,
    selectedDone,
    createTodo,
    updateDone,
    markUndone,
    undoLast,
    demoCompleteFirst,
  };
}
