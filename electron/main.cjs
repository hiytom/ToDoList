const { app, BrowserWindow, ipcMain, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

const isDev = !app.isPackaged;
const STORE_FILE = "todo-state.json";
const STORAGE_DIR = "ToDoList";
const BACKUP_DIR = "backups";
const MAX_BACKUPS = 10;

function getStorePath() {
  return path.join(app.getPath("appData"), STORAGE_DIR, STORE_FILE);
}

function getBackupDir() {
  return path.join(app.getPath("appData"), STORAGE_DIR, BACKUP_DIR);
}

function getLegacyStorePaths() {
  return [
    path.join(app.getPath("userData"), STORE_FILE),
    path.join(app.getPath("appData"), "todo-cal", STORE_FILE),
    path.join(app.getPath("appData"), "com.hiytom.todolist", STORE_FILE),
  ].filter((candidate, index, all) => all.indexOf(candidate) === index && candidate !== getStorePath());
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureStoreMigrated() {
  const canonicalStorePath = getStorePath();
  if (await fileExists(canonicalStorePath)) return;

  for (const legacyStorePath of getLegacyStorePaths()) {
    if (!(await fileExists(legacyStorePath))) continue;
    await fs.mkdir(path.dirname(canonicalStorePath), { recursive: true });
    await fs.copyFile(legacyStorePath, canonicalStorePath);
    return;
  }
}

async function readLatestBackup() {
  try {
    const backupDir = getBackupDir();
    const entries = await fs.readdir(backupDir);
    const backupNames = entries
      .filter((name) => name.startsWith("todo-state-") && name.endsWith(".json"))
      .sort()
      .reverse();

    for (const backupName of backupNames) {
      const raw = await fs.readFile(path.join(backupDir, backupName), "utf8");
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed) {
        return parsed;
      }
    }
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) {
      console.error("Failed to read backup todo data:", error);
    }
  }

  return {};
}

async function readStore() {
  await ensureStoreMigrated();
  try {
    const raw = await fs.readFile(getStorePath(), "utf8");
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return {};
    }
    console.error("Failed to read persisted todo data:", error);
    return readLatestBackup();
  }
}

async function backupExistingStore() {
  const storePath = getStorePath();
  if (!(await fileExists(storePath))) return;

  const backupDir = getBackupDir();
  await fs.mkdir(backupDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `todo-state-${stamp}.json`);
  await fs.copyFile(storePath, backupPath);

  const entries = (await fs.readdir(backupDir))
    .filter((name) => name.startsWith("todo-state-") && name.endsWith(".json"))
    .sort()
    .reverse();

  await Promise.all(
    entries.slice(MAX_BACKUPS).map((name) => fs.rm(path.join(backupDir, name), { force: true }))
  );
}

async function writeStore(store) {
  const storePath = getStorePath();
  await ensureStoreMigrated();
  await backupExistingStore();
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1480,
    height: 980,
    minWidth: 1240,
    minHeight: 860,
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

  window.loadFile(path.join(app.getAppPath(), "dist", "index.html"));
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
