const fs = require('fs')
const path = require('path')
const ROOT = path.join(__dirname, '..', 'src', 'pages')

const MAP = {
  'var(--color-primary)': '#2E7D32',
  'var(--color-primary-light)': '#4CAF50',
  'var(--color-primary-dark)': '#1B5E20',
  'var(--color-secondary)': '#FF8F00',
  'var(--color-secondary-light)': '#FFB300',
  'var(--color-danger)': '#D32F2F',
  'var(--color-text)': '#212121',
  'var(--color-text-secondary)': '#616161',
  'var(--color-text-light)': '#9E9E9E',
  'var(--color-bg)': '#F5F5F5',
  'var(--color-bg-white)': '#FFFFFF',
  'var(--color-border)': '#E0E0E0',
  'var(--color-success)': '#388E3C',
  'var(--color-warning)': '#F57C00',
  'var(--color-info)': '#1976D2',
  'var(--font-size-xs)': '12px',
  'var(--font-size-sm)': '14px',
  'var(--font-size-base)': '16px',
  'var(--font-size-lg)': '18px',
  'var(--font-size-xl)': '20px',
  'var(--font-size-2xl)': '24px',
  'var(--font-size-3xl)': '28px',
  'var(--font-size-4xl)': '32px',
  'var(--spacing-xs)': '4px',
  'var(--spacing-sm)': '8px',
  'var(--spacing-md)': '12px',
  'var(--spacing-lg)': '16px',
  'var(--spacing-xl)': '24px',
  'var(--spacing-2xl)': '32px',
  'var(--radius-sm)': '8px',
  'var(--radius-md)': '12px',
  'var(--radius-lg)': '16px',
  'var(--radius-xl)': '24px',
}

function walk(dir, list = []) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f)
    if (fs.statSync(full).isDirectory()) walk(full, list)
    else if (f.endsWith('.tsx')) list.push(full)
  })
  return list
}

const files = walk(ROOT)
let total = 0
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8')
  let changed = false
  Object.entries(MAP).forEach(([k, v]) => {
    const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    const newC = content.replace(re, v)
    if (newC !== content) {
      total += (content.match(re) || []).length
      content = newC
      changed = true
    }
  })
  if (changed) {
    fs.writeFileSync(file, content, 'utf-8')
    console.log(`Fixed: ${path.relative(ROOT, file)}`)
  }
})
console.log(`\nTotal var() replacements: ${total}`)
