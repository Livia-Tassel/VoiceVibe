import { app, BrowserWindow, globalShortcut, ipcMain, clipboard, screen, session } from 'electron'
import { join } from 'path'
import { createHmac } from 'crypto'
import WebSocket from 'ws'

// 代理地址配置（从环境变量读取）
function resolveProxyRules(rawValue?: string): string | undefined {
  if (!rawValue) {
    return undefined
  }

  const trimmed = rawValue.trim()
  if (!trimmed) {
    return undefined
  }

  if (/\s/.test(trimmed)) {
    return undefined
  }

  if (trimmed.includes('://')) {
    try {
      const url = new URL(trimmed)
      if (!url.hostname) {
        return undefined
      }
      return trimmed
    } catch (error) {
      console.warn('Invalid proxy URL:', trimmed, error)
      return undefined
    }
  }

  if (/^[^:]+:\d+$/.test(trimmed)) {
    return trimmed
  }

  return trimmed
}

let mainWindow: BrowserWindow | null = null

// 讯飞语音识别 API
async function transcribeWithXunfei(
  audioData: number[],
  appId: string,
  apiKey: string,
  apiSecret: string
): Promise<{ ok: boolean; text?: string; error?: string }> {
  return new Promise((resolve) => {
    try {
      // 生成鉴权 URL
      const host = 'iat-api.xfyun.cn'
      const path = '/v2/iat'
      const date = new Date().toUTCString()

      // 生成签名
      const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`
      const signature = createHmac('sha256', apiSecret)
        .update(signatureOrigin)
        .digest('base64')

      const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
      const authorization = Buffer.from(authorizationOrigin).toString('base64')

      const url = `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`

      console.log('Connecting to Xunfei WebSocket...')

      const ws = new WebSocket(url)
      let fullText = ''
      let hasError = false

      ws.on('open', () => {
        console.log('Xunfei WebSocket connected')

        // 将音频数据转换为 base64
        const audioBuffer = Buffer.from(audioData)
        const audioBase64 = audioBuffer.toString('base64')

        // 每帧发送的 base64 字符数（必须是 4 的倍数）
        const charsPerFrame = 2560 // 约 1920 字节的音频数据

        // 发送第一帧
        const firstFrame = {
          common: { app_id: appId },
          business: {
            language: 'zh_cn',
            domain: 'iat',
            accent: 'mandarin',
            vad_eos: 3000,
            dwa: 'wpgs',
          },
          data: {
            status: 0,
            format: 'audio/L16;rate=16000',
            encoding: 'raw',
            audio: audioBase64.slice(0, Math.min(charsPerFrame, audioBase64.length)),
          },
        }
        ws.send(JSON.stringify(firstFrame))

        // 发送中间帧和最后一帧
        let offset = Math.min(charsPerFrame, audioBase64.length)
        const sendNextFrame = () => {
          if (offset >= audioBase64.length) {
            // 发送最后一帧
            const lastFrame = {
              data: {
                status: 2,
                format: 'audio/L16;rate=16000',
                encoding: 'raw',
                audio: '',
              },
            }
            ws.send(JSON.stringify(lastFrame))
            return
          }

          const chunk = audioBase64.slice(offset, offset + charsPerFrame)
          offset += charsPerFrame

          const midFrame = {
            data: {
              status: 1,
              format: 'audio/L16;rate=16000',
              encoding: 'raw',
              audio: chunk,
            },
          }
          ws.send(JSON.stringify(midFrame))

          // 控制发送速度，模拟实时音频流
          setTimeout(sendNextFrame, 40)
        }

        setTimeout(sendNextFrame, 40)
      })

      ws.on('message', (data: WebSocket.Data) => {
        try {
          const result = JSON.parse(data.toString())
          console.log('Xunfei response:', JSON.stringify(result).substring(0, 200))

          if (result.code !== 0) {
            hasError = true
            ws.close()
            resolve({ ok: false, error: `讯飞错误: ${result.code} - ${result.message}` })
            return
          }

          // 解析识别结果
          if (result.data && result.data.result) {
            const ws_result = result.data.result.ws || []
            for (const item of ws_result) {
              const cw = item.cw || []
              for (const word of cw) {
                fullText += word.w || ''
              }
            }
          }

          // 检查是否结束
          if (result.data && result.data.status === 2) {
            ws.close()
          }
        } catch (e) {
          console.error('Parse error:', e)
        }
      })

      ws.on('close', () => {
        console.log('Xunfei WebSocket closed, text:', fullText)
        if (!hasError) {
          resolve({ ok: true, text: fullText.trim() || '(未识别到语音)' })
        }
      })

      ws.on('error', (err) => {
        console.error('Xunfei WebSocket error:', err)
        resolve({ ok: false, error: `WebSocket 错误: ${err.message}` })
      })

      // 超时处理
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
          if (!hasError && !fullText) {
            resolve({ ok: false, error: '识别超时' })
          }
        }
      }, 30000)

    } catch (error) {
      console.error('Xunfei error:', error)
      resolve({ ok: false, error: String(error) })
    }
  })
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
  // 设置代理（用于渲染进程的网络请求）
  const proxyRules = resolveProxyRules(process.env.PROXY_URL)
  if (proxyRules) {
    await session.defaultSession.setProxy({
      proxyRules,
      proxyBypassRules: 'localhost,127.0.0.1',
    })
    console.log('Proxy configured:', proxyRules)
  } else {
    console.log('Proxy not configured, skipping setProxy.')
  }

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

// 讯飞语音识别
ipcMain.handle('whisper:transcribe', async (_event, args: {
  audioData: number[]
  language: string
  appId: string
  apiKey: string
  apiSecret: string
}) => {
  console.log('Received transcribe request, audio size:', args.audioData.length, 'bytes')
  return await transcribeWithXunfei(
    args.audioData,
    args.appId,
    args.apiKey,
    args.apiSecret
  )
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
