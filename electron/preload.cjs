const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopApp", {
  platform: process.platform,
  isMacOS: process.platform === "darwin",
  storage: {
    loadTodos: () => ipcRenderer.invoke("todo-storage:load"),
    loadSettings: () => ipcRenderer.invoke("todo-storage:load-settings"),
    saveTodos: (todos) => ipcRenderer.invoke("todo-storage:save", todos),
    saveSettings: (settings) => ipcRenderer.invoke("todo-storage:save-settings", settings),
  },
});
