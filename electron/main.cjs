const { app, BrowserWindow, ipcMain, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

const isDev = !app.isPackaged;
const STORE_FILE = "todo-state.json";

function getStorePath() {
  return path.join(app.getPath("userData"), STORE_FILE);
}

async function readStore() {
  try {
    const raw = await fs.readFile(getStorePath(), "utf8");
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return {};
    }
    console.error("Failed to read persisted todo data:", error);
    return {};
  }
}

async function writeStore(store) {
  const storePath = getStorePath();
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 760,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 18, y: 16 },
    backgroundColor: "#f7f7f3",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    window.loadURL("http://127.0.0.1:5173");
    window.webContents.openDevTools({ mode: "detach" });
    return;
  }

  window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
}

app.whenReady().then(() => {
  ipcMain.handle("todo-storage:load", async () => {
    const store = await readStore();
    return Array.isArray(store.todos) ? store.todos : null;
  });

  ipcMain.handle("todo-storage:load-settings", async () => {
    const store = await readStore();
    return typeof store.settings === "object" && store.settings ? store.settings : null;
  });

  ipcMain.handle("todo-storage:save", async (_event, todos) => {
    const store = await readStore();
    await writeStore({
      ...store,
      version: 1,
      todos: Array.isArray(todos) ? todos : [],
      updatedAt: Date.now(),
    });
    return { ok: true, path: getStorePath() };
  });

  ipcMain.handle("todo-storage:save-settings", async (_event, settings) => {
    const store = await readStore();
    await writeStore({
      ...store,
      version: 1,
      settings: typeof settings === "object" && settings ? settings : {},
      updatedAt: Date.now(),
    });
    return { ok: true, path: getStorePath() };
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
