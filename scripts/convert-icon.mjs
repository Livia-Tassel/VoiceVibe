import sharp from 'sharp'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

async function convertSvgToPng() {
  const svgPath = join(rootDir, 'assets', 'icon.svg')
  const pngPath = join(rootDir, 'assets', 'icon.png')

  // Read SVG
  const svgBuffer = readFileSync(svgPath)

  // Convert to 1024x1024 PNG (required for electron-icon-builder)
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(pngPath)

  console.log('✓ Created assets/icon.png (1024x1024)')
}

convertSvgToPng().catch(console.error)
