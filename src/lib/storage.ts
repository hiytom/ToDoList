import { doneAtForDate } from "./date";
import type { Todo } from "../types/todo";
import type { AppSettings } from "../types/settings";

const STORAGE_KEY = "todo-cal.todos.v1";
const SETTINGS_STORAGE_KEY = "todo-cal.settings.v1";

function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== "object") return false;
  const todo = value as Record<string, unknown>;

  return (
    typeof todo.id === "string" &&
    typeof todo.title === "string" &&
    typeof todo.createdAt === "number" &&
    (typeof todo.doneAt === "undefined" || typeof todo.doneAt === "number")
  );
}

function parseTodos(value: unknown): Todo[] | null {
  if (!Array.isArray(value)) return null;
  const todos = value.filter(isTodo);
  return todos.length === value.length ? todos : null;
}

function isSettings(value: unknown): value is AppSettings {
  if (!value || typeof value !== "object") return false;
  const settings = value as Record<string, unknown>;

  return (
    (settings.lang === "en" || settings.lang === "zh") &&
    typeof settings.theme === "string" &&
    typeof settings.dark === "boolean" &&
    typeof settings.compact === "boolean" &&
    typeof settings.showDayPanel === "boolean" &&
    typeof settings.demoDismissed === "boolean"
  );
}

export function getDefaultSettings(): AppSettings {
  return {
    lang: "zh",
    theme: "mint",
    dark: false,
    compact: false,
    showDayPanel: true,
    demoDismissed: false,
  };
}

export function getDefaultTodos(today: Date): Todo[] {
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
}

function loadFromLocalStorage(): Todo[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseTodos(JSON.parse(raw));
  } catch (error) {
    console.error("Failed to read todos from localStorage:", error);
    return null;
  }
}

function saveToLocalStorage(todos: Todo[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error("Failed to save todos to localStorage:", error);
  }
}

function loadSettingsFromLocalStorage(): AppSettings | null {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isSettings(parsed) ? parsed : null;
  } catch (error) {
    console.error("Failed to read settings from localStorage:", error);
    return null;
  }
}

function saveSettingsToLocalStorage(settings: AppSettings) {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error);
  }
}

export async function loadPersistedTodos(today: Date): Promise<Todo[]> {
  const desktopStorage = window.desktopApp?.storage;
  if (desktopStorage) {
    try {
      const todos = parseTodos(await desktopStorage.loadTodos());
      if (todos) return todos;
      return [];
    } catch (error) {
      console.error("Failed to read todos from desktop storage:", error);
      return [];
    }
  }

  return loadFromLocalStorage() ?? getDefaultTodos(today);
}

export async function persistTodos(todos: Todo[]): Promise<void> {
  const desktopStorage = window.desktopApp?.storage;
  if (desktopStorage) {
    try {
      await desktopStorage.saveTodos(todos);
      return;
    } catch (error) {
      console.error("Failed to save todos to desktop storage:", error);
    }
  }

  saveToLocalStorage(todos);
}

export async function loadPersistedSettings(): Promise<AppSettings> {
  const desktopStorage = window.desktopApp?.storage;
  if (desktopStorage) {
    try {
      const settings = await desktopStorage.loadSettings();
      if (settings && isSettings(settings)) return settings;
    } catch (error) {
      console.error("Failed to read settings from desktop storage:", error);
    }
  }

  return loadSettingsFromLocalStorage() ?? getDefaultSettings();
}

export async function persistSettings(settings: AppSettings): Promise<void> {
  const desktopStorage = window.desktopApp?.storage;
  if (desktopStorage) {
    try {
      await desktopStorage.saveSettings(settings);
      return;
    } catch (error) {
      console.error("Failed to save settings to desktop storage:", error);
    }
  }

  saveSettingsToLocalStorage(settings);
}
