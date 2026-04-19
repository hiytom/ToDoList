import type { Todo } from "./todo";
import type { AppSettings } from "./settings";

type DesktopStorageApi = {
  loadTodos: () => Promise<Todo[] | null>;
  loadSettings: () => Promise<AppSettings | null>;
  saveTodos: (todos: Todo[]) => Promise<{ ok: true; path: string }>;
  saveSettings: (settings: AppSettings) => Promise<{ ok: true; path: string }>;
};

declare global {
  interface Window {
    desktopApp?: {
      platform: string;
      isMacOS: boolean;
      storage: DesktopStorageApi;
    };
  }
}

export {};
