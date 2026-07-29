// מייצר את קובצי ה-PNG של האייקונים מתוך ה-SVG.
// iOS ואנדרואיד לא מקבלים SVG לאייקון של מסך הבית, ולכן צריך PNG אמיתי.
// הרצה: npm run icons  (רק אחרי שינוי ב-public/icon.svg)

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

/** [קובץ מקור, קובץ יעד, גודל] */
const TARGETS = [
  ['icon.svg', 'favicon-32.png', 32],
  ['icon.svg', 'icon-192.png', 192],
  ['icon.svg', 'icon-512.png', 512],
  // ריבוע מלא בגודל ציור רגיל — iOS מעגל פינות בלבד
  ['icon-square.svg', 'apple-touch-icon.png', 180],
  // ציור מכווץ לאזור בטיחות של 80% — אנדרואיד חותך לצורת המכשיר, לרוב עיגול
  ['icon-maskable.svg', 'icon-512-maskable.png', 512],
]

for (const [source, target, size] of TARGETS) {
  const svg = await readFile(join(publicDir, source))
  const png = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain' })
    .png({ compressionLevel: 9 })
    .toBuffer()

  await writeFile(join(publicDir, target), png)
  console.log(`${target}  ${size}x${size}  ${(png.length / 1024).toFixed(1)} kB`)
}
