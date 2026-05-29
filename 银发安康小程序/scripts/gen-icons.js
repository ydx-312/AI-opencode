// Generate minimal 48x48 PNG icons for tabBar
const fs = require('fs')
const path = require('path')

// Minimal 48x48 green PNG (base64 encoded - 1px actually, but works for tabBar)
// We'll create simple filled circle PNGs in different colors
const colors = {
  home: [76, 175, 80],         // #4CAF50 green
  caregiver: [33, 150, 243],   // #2196F3 blue
  message: [255, 152, 0],      // #FF9800 orange
  profile: [156, 39, 176],     // #9C27B0 purple
}

// Simple function to create a PNG with a colored circle
function createPNG(iconName, active) {
  // Create a tiny valid PNG with simple pattern
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  
  // IHDR chunk: 48x48, 8-bit RGBA
  const width = 48, height = 48
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8  // bit depth
  ihdrData[9] = 6  // color type: RGBA
  ihdrData[10] = 0 // compression
  ihdrData[11] = 0 // filter
  ihdrData[12] = 0 // interlace

  const color = active ? colors[iconName] : [200, 200, 200]
  const r = color[0], g = color[1], b = color[2]
  
  // Image data: each row has filter byte(0) + pixels(RGBA)
  const rowLen = 1 + width * 4
  const rawData = Buffer.alloc(height * rowLen)
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLen
    rawData[rowOffset] = 0 // filter: none
    for (let x = 0; x < width; x++) {
      // Draw a simple house/circle shape
      const cx = 24, cy = 24, rSize = 16
      const dx = x - cx, dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const isInside = dist <= rSize
      
      const pixOffset = rowOffset + 1 + x * 4
      if (isInside) {
        rawData[pixOffset] = r
        rawData[pixOffset + 1] = g
        rawData[pixOffset + 2] = b
        rawData[pixOffset + 3] = 255
      } else {
        rawData[pixOffset] = 0
        rawData[pixOffset + 1] = 0
        rawData[pixOffset + 2] = 0
        rawData[pixOffset + 3] = 0
      }
    }
  }

  // Compress with zlib
  const zlib = require('zlib')
  const compressed = zlib.deflateSync(rawData)

  // Build PNG file
  const crc32 = (buf) => {
    let c = 0xffffffff
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff]
    }
    return (c ^ 0xffffffff) >>> 0
  }

  // Generate CRC table
  const crcTable = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    }
    crcTable[n] = c
  }

  const makeChunk = (type, data) => {
    const typeB = Buffer.from(type)
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const crcData = Buffer.concat([typeB, data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(crcData))
    return Buffer.concat([len, typeB, data, crc])
  }

  const ihdr = makeChunk('IHDR', ihdrData)
  const idat = makeChunk('IDAT', compressed)
  const iend = makeChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([sig, ihdr, idat, iend])
}

// Generate all icons
const names = ['home', 'caregiver', 'message', 'profile']
const assetsDir = path.join(__dirname, '..', 'src', 'assets')

names.forEach(name => {
  const normal = createPNG(name, false)
  const active = createPNG(name, true)
  fs.writeFileSync(path.join(assetsDir, `${name}.png`), normal)
  fs.writeFileSync(path.join(assetsDir, `${name}-active.png`), active)
  console.log(`Created ${name}.png and ${name}-active.png`)
})
