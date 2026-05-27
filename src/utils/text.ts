export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function readingTimeMinutes(text: string): number {
  return Math.max(1, Math.round(wordCount(text) / 200))
}

export function downloadTextFile(content: string, company: string, role: string): void {
  const slug = `${company || 'company'}-${role || 'role'}`
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cover-letter-${slug}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        resolve(result.split(',')[1] ?? '')
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('File read error'))
    reader.readAsDataURL(file)
  })
}
