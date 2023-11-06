import * as process from 'node:process';
import { app, BrowserWindow, Menu, nativeTheme } from 'electron';
import { isDevelopment, isTest, titleBarIcon, createHtmlFilePath, initialState as ils, packageJson } from './utils.mjs';
import { ipc, removeIpc } from './ipc.mjs';
import ipcRemoteHandle from './ipcHandle/ipcRemoteHandle.mjs';
import pocket48LiveRemoteHandle from './ipcHandle/pocket48LiveRemoteHandle.mjs';
import { nodeMediaServerClose } from './nodeMediaServer/nodeMediaServer.mjs';
import weiboResourceRequestInit from './webRequest/weiboResourceRequest.mjs';
import { storeInit, getStore } from './store.mjs';
import logProtocol from './logProtocol/logProtocol.mjs';
import { commandLineOptions } from './commend.mjs';
import type { ThemeValue } from './ipcListener/themeChange.mjs';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'; // 关闭警告

/* BrowserWindow窗口对象 */
let win: BrowserWindow | null = null;

/* 初始化 */
function createWindow(): void {
  // 初始化设置当前的主题
  storeInit();

  const themeSource: ThemeValue | undefined = getStore().get('theme');

  if (themeSource) {
    nativeTheme.themeSource = themeSource;
  }

  logProtocol();

  win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      contextIsolation: false
    },
    title: `48tools - ${ packageJson.version }`,
    icon: titleBarIcon,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#000000' : undefined
  });

  if (isDevelopment && !isTest) {
    win.webContents.openDevTools();
  }

  win.loadFile(createHtmlFilePath('index'),
    {
      query: {
        initialState: ils({
          theme: themeSource ?? 'system',
          commandLineOptions,
          isTest
        })
      }
    }
  );

  // 去掉顶层菜单
  Menu.setApplicationMenu(null);

  ipc(win);

  try {
    ipcRemoteHandle(win);
    pocket48LiveRemoteHandle(win);
  } catch {}

  win.on('closed', async function(): Promise<void> {
    await nodeMediaServerClose();
    removeIpc();
    win = null;
  });

  weiboResourceRequestInit();
}

// https://github.com/microsoft/vscode/issues/116715#issuecomment-917783861
app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer');

app.whenReady().then(createWindow);

app.on('window-all-closed', function(): void {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function(): void {
  if (win === null) {
    createWindow();
  }
});