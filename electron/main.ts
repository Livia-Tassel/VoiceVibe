import { app, BrowserWindow, globalShortcut, ipcMain, clipboard, screen, session } from 'electron'
import { join } from 'path'
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs'
import { tmpdir } from 'os'

// 代理地址配置（用于 API 调用）
const PROXY_URL = '127.0.0.1:7897'

let mainWindow: BrowserWindow | null = null
let whisperPipeline: any = null

// 初始化本地 Whisper 模型
async function initWhisper() {
  if (whisperPipeline) return whisperPipeline

  console.log('Loading local Whisper model...')
  const { pipeline } = await import('@xenova/transformers')

  // 使用 base 模型，支持多语言
  whisperPipeline = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
    // 模型会自动下载到缓存目录
  })

  console.log('Whisper model loaded!')
  return whisperPipeline
}

// 本地转录音频
async function transcribeLocal(audioData: number[], language: string): Promise<{ ok: boolean; text?: string; error?: string }> {
  try {
    const transcriber = await initWhisper()

    // 保存音频到临时文件
    const tempDir = join(tmpdir(), 'voicevibe')
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true })
    }
    const tempFile = join(tempDir, `audio_${Date.now()}.webm`)
    writeFileSync(tempFile, Buffer.from(audioData))

    console.log('Transcribing audio locally...')
    const result = await transcriber(tempFile, {
      language: language === 'zh' ? 'chinese' : 'english',
      task: 'transcribe',
    })

    // 删除临时文件
    try {
      unlinkSync(tempFile)
    } catch (e) {
      // 忽略删除错误
    }

    console.log('Transcription result:', result)
    return { ok: true, text: result.text }
  } catch (error) {
    console.error('Local transcription error:', error)
    return { ok: false, error: String(error) }
  }
}

// API 调用函数（用于 ChatGPT API）
async function callOpenAI(endpoint: string, options: {
  method: string
  headers: Record<string, string>
  body?: string
  proxyUrl?: string
  apiBaseUrl?: string
}) {
  const { default: fetch } = await import('node-fetch')

  const baseUrl = options.apiBaseUrl || 'https://api.openai.com'
  const url = `${baseUrl}${endpoint}`
  console.log('API URL:', url)

  // 配置代理
  let agent: any = undefined
  if (options.proxyUrl) {
    const { HttpsProxyAgent } = await import('https-proxy-agent')
    agent = new HttpsProxyAgent(options.proxyUrl)
    console.log('Using proxy:', options.proxyUrl)
  }

  const response = await fetch(url, {
    method: options.method,
    headers: options.headers,
    body: options.body,
    agent,
  })

  const responseText = await response.text()
  console.log('API Response Status:', response.status)
  console.log('API Response Body:', responseText.substring(0, 500))

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

  const url = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
  console.log('Loading URL:', url)

  mainWindow.loadURL(url)

  // 开发时打开 DevTools
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    mainWindow?.focus()
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

app.whenReady().then(async () => {
  // 设置代理（用于 API 调用）
  await session.defaultSession.setProxy({
    proxyRules: PROXY_URL,
    proxyBypassRules: 'localhost,127.0.0.1'
  })
  console.log('Proxy configured:', PROXY_URL)

  // 预加载 Whisper 模型
  initWhisper().catch(err => {
    console.error('Failed to preload Whisper:', err)
  })

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
ipcMain.handle('window:hide', () => mainWindow?.hide())
ipcMain.handle('window:show', () => { mainWindow?.show(); mainWindow?.focus() })
ipcMain.handle('window:toggle', () => toggleWindow())
ipcMain.handle('window:minimize', () => mainWindow?.minimize())
ipcMain.handle('window:close', () => mainWindow?.close())

ipcMain.handle('clipboard:write', (_event, text: string) => {
  clipboard.writeText(text)
  return true
})

ipcMain.handle('clipboard:read', () => clipboard.readText())

// 本地语音转录（使用 Whisper）
ipcMain.handle('whisper:transcribe', async (_event, args: {
  audioData: number[]
  language: string
}) => {
  console.log('Received transcribe request, audio size:', args.audioData.length)
  return await transcribeLocal(args.audioData, args.language)
})

// ChatGPT API（用于优化 Prompt）
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
