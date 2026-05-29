function toBeijing(d?: Date): Date {
  const date = d || new Date()
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  return new Date(utc + 8 * 3600000)
}

export function formatDate(date: string | Date): string {
  const d = toBeijing(new Date(date))
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateTime(date: string | Date): string {
  const d = toBeijing(new Date(date))
  const dateStr = formatDate(d)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${dateStr} ${hours}:${minutes}`
}

export function getNowBeijingISO(): string {
  const d = toBeijing()
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0') + 'T' +
    String(d.getHours()).padStart(2, '0') + ':' +
    String(d.getMinutes()).padStart(2, '0') + ':' +
    String(d.getSeconds()).padStart(2, '0') + '+08:00'
}

export function formatBeijingDateTime(date: string | Date): string {
  const d = toBeijing(new Date(date))
  return d.getFullYear() + '年' +
    (d.getMonth() + 1) + '月' +
    d.getDate() + '日 ' +
    String(d.getHours()).padStart(2, '0') + ':' +
    String(d.getMinutes()).padStart(2, '0')
}

export function getRelativeTime(date: string | Date): string {
  const now = toBeijing()
  const d = toBeijing(new Date(date))
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return formatDate(date)
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

export function mockImageUrl(width: number, height: number, text: string): string {
  return `https://placehold.co/${width}x${height}/2E7D32/FFFFFF?text=${encodeURIComponent(text)}`
}
