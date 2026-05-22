export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeekLabel(monday: Date): string {
  const startMonth = monday.getMonth() + 1
  const startDate = monday.getDate()
  const end = new Date(monday)
  end.setDate(end.getDate() + 6)
  const endMonth = end.getMonth() + 1
  return `${startMonth}/${startDate} - ${endMonth}/${end.getDate()}`
}

export function isInWeek(dateStr: string, monday: Date): boolean {
  const d = new Date(dateStr)
  const start = new Date(monday)
  const end = new Date(monday)
  end.setDate(end.getDate() + 7)
  return d >= start && d < end
}

export function isInYear(dateStr: string, year: number): boolean {
  const d = new Date(dateStr)
  return d.getFullYear() === year
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}
