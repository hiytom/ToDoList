import { useEffect, useMemo, useState, type RefObject } from "react";
import type { AnimationControls } from "framer-motion";
import { doneAtForDate, ymd } from "../lib/date";
import { loadPersistedTodos, persistTodos } from "../lib/storage";
import type { Todo, UndoAction } from "../types/todo";

type UseTodoDataArgs = {
  today: Date;
  monthCursor: Date;
  selectedDay: Date;
  controls: AnimationControls;
  listRef: RefObject<HTMLDivElement>;
};

export function useTodoData({ today, monthCursor, selectedDay, controls, listRef }: UseTodoDataArgs) {
  const [title, setTitle] = useState("");
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [hasLoadedTodos, setHasLoadedTodos] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void loadPersistedTodos(today).then((loadedTodos) => {
      if (cancelled) return;
      setTodos(loadedTodos);
      setHasLoadedTodos(true);
    });

    return () => {
      cancelled = true;
    };
  }, [today]);

  useEffect(() => {
    if (!hasLoadedTodos) return;
    void persistTodos(todos);
  }, [hasLoadedTodos, todos]);

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

  function updateTodoTitle(todoId: string, nextTitle: string) {
    const trimmed = nextTitle.trim();
    if (!trimmed) return false;
    setTodos((old) => old.map((x) => (x.id === todoId ? { ...x, title: trimmed } : x)));
    return true;
  }

  function deleteTodo(todoId: string) {
    setTodos((old) => old.filter((x) => x.id !== todoId));
    setUndoAction((old) => (old?.todoId === todoId ? null : old));
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
    updateTodoTitle,
    deleteTodo,
    undoLast,
    demoCompleteFirst,
  };
}
