import { app, BrowserWindow, globalShortcut, ipcMain, clipboard, screen } from 'electron'
import { join } from 'path'

let mainWindow: BrowserWindow | null = null

// API 调用函数（在主进程中执行，不受 CORS 限制）
async function callOpenAI(endpoint: string, options: {
  method: string
  headers: Record<string, string>
  body?: string | FormData
  isFormData?: boolean
  formDataFields?: { file: { data: number[], name: string, type: string }, model: string, language: string }
  proxyUrl?: string
  apiBaseUrl?: string
}) {
  const { default: fetch } = await import('node-fetch')
  const FormData = (await import('form-data')).default

  const baseUrl = options.apiBaseUrl || 'https://api.openai.com'
  const url = `${baseUrl}${endpoint}`
  console.log('API URL:', url)

  let body: any = options.body
  const headers: Record<string, string> = { ...options.headers }

  // 处理 FormData（用于 Whisper API）
  if (options.formDataFields) {
    const formData = new FormData()
    const fileData = Buffer.from(options.formDataFields.file.data)
    formData.append('file', fileData, {
      filename: options.formDataFields.file.name,
      contentType: options.formDataFields.file.type,
    })
    formData.append('model', options.formDataFields.model)
    formData.append('language', options.formDataFields.language)
    body = formData
    Object.assign(headers, formData.getHeaders())
  }

  // 配置代理
  let agent: any = undefined
  if (options.proxyUrl) {
    const { HttpsProxyAgent } = await import('https-proxy-agent')
    agent = new HttpsProxyAgent(options.proxyUrl)
    console.log('Using proxy:', options.proxyUrl)
  }

  const response = await fetch(url, {
    method: options.method,
    headers,
    body,
    agent,
  })

  const responseText = await response.text()
  console.log('API Response Status:', response.status)
  console.log('API Response Body:', responseText)

  let data
  try {
    data = JSON.parse(responseText)
  } catch {
    data = { error: responseText }
  }
  return { ok: response.ok, status: response.status, data }
}

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize

  const windowWidth = 800
  const windowHeight = 600

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: Math.floor((screenWidth - windowWidth) / 2),
    y: Math.floor((screenHeight - windowHeight) / 2),
    frame: false,
    transparent: false,
    resizable: true,
    skipTaskbar: false,
    show: false,
    backgroundColor: '#1a1a1a',
    trafficLightPosition: { x: 12, y: 12 },
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    roundedCorners: true,
    webPreferences: {
      preload: join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  // mainWindow.setAlwaysOnTop(true, 'floating') // 注释掉强制置顶

  const url = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
  console.log('Loading URL:', url)
  console.log('VITE_DEV_SERVER_URL:', process.env.VITE_DEV_SERVER_URL)

  mainWindow.loadURL(url)

  // 打开 DevTools 以便调试
  mainWindow.webContents.openDevTools({ mode: 'detach' })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })

  mainWindow.on('blur', () => {
    // Optional: hide on blur
    // mainWindow?.hide()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function toggleWindow() {
  if (!mainWindow) {
    createWindow()
    return
  }

  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
}

function registerGlobalShortcut() {
  // Option+Command+P for macOS, Ctrl+Alt+P for Windows/Linux
  const shortcut = process.platform === 'darwin' ? 'Option+Command+P' : 'Ctrl+Alt+P'

  const success = globalShortcut.register(shortcut, () => {
    toggleWindow()
  })

  if (!success) {
    console.error('Failed to register global shortcut:', shortcut)
  } else {
    console.log('Global shortcut registered:', shortcut)
  }
}

app.whenReady().then(() => {
  createWindow()
  registerGlobalShortcut()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers
ipcMain.handle('window:hide', () => {
  mainWindow?.hide()
})

ipcMain.handle('window:show', () => {
  mainWindow?.show()
  mainWindow?.focus()
})

ipcMain.handle('window:toggle', () => {
  toggleWindow()
})

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

ipcMain.handle('clipboard:write', (_event, text: string) => {
  clipboard.writeText(text)
  return true
})

ipcMain.handle('clipboard:read', () => {
  return clipboard.readText()
})

// OpenAI API handlers
ipcMain.handle('openai:transcribe', async (_event, args: {
  audioData: number[]
  apiKey: string
  language: string
  proxyUrl?: string
  apiBaseUrl?: string
  model?: string
}) => {
  try {
    const model = args.model || 'whisper-1'
    console.log('Using whisper model:', model)
    const result = await callOpenAI('/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${args.apiKey}`,
      },
      formDataFields: {
        file: {
          data: args.audioData,
          name: 'audio.webm',
          type: 'audio/webm',
        },
        model: model,
        language: args.language,
      },
      proxyUrl: args.proxyUrl,
      apiBaseUrl: args.apiBaseUrl,
    })
    return result
  } catch (error) {
    console.error('Transcribe error:', error)
    return { ok: false, error: String(error) }
  }
})

ipcMain.handle('openai:chat', async (_event, args: {
  messages: Array<{ role: string; content: string }>
  apiKey: string
  proxyUrl?: string
  apiBaseUrl?: string
  model?: string
}) => {
  try {
    const model = args.model || 'gpt-4o-mini'
    console.log('Using model:', model)
    const result = await callOpenAI('/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${args.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: args.messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
      proxyUrl: args.proxyUrl,
      apiBaseUrl: args.apiBaseUrl,
    })
    return result
  } catch (error) {
    console.error('Chat error:', error)
    return { ok: false, error: String(error) }
  }
})
