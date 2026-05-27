import { describe, it, expect, vi, afterEach } from 'vitest'
import { wordCount, readingTimeMinutes, downloadTextFile, readFileAsBase64 } from '../utils/text.ts'

describe('wordCount', () => {
  it('counts words in a normal sentence', () => {
    expect(wordCount('Hello world foo')).toBe(3)
  })

  it('returns 0 for empty string', () => {
    expect(wordCount('')).toBe(0)
  })

  it('handles extra whitespace', () => {
    expect(wordCount('  one  two   three  ')).toBe(3)
  })

  it('handles single word', () => {
    expect(wordCount('word')).toBe(1)
  })
})

describe('readingTimeMinutes', () => {
  it('returns at least 1 minute', () => {
    expect(readingTimeMinutes('short')).toBe(1)
  })

  it('estimates correctly for 200 words', () => {
    const text = Array(200).fill('word').join(' ')
    expect(readingTimeMinutes(text)).toBe(1)
  })

  it('estimates correctly for 400 words', () => {
    const text = Array(400).fill('word').join(' ')
    expect(readingTimeMinutes(text)).toBe(2)
  })

  it('rounds to nearest minute', () => {
    const text = Array(300).fill('word').join(' ')
    expect(readingTimeMinutes(text)).toBe(2)
  })
})

describe('downloadTextFile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a download link and clicks it', () => {
    const createObjectURL = vi.fn(() => 'blob:mock')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, writable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, writable: true })

    const clickSpy = vi.fn()
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement)

    downloadTextFile('Hello world', 'Monzo', 'Senior Developer')
    expect(createElement).toHaveBeenCalledWith('a')
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })

  it('slugifies the filename correctly', () => {
    const createObjectURL = vi.fn(() => 'blob:mock')
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, writable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), writable: true })

    let downloadAttr = ''
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      get download() { return downloadAttr },
      set download(v: string) { downloadAttr = v },
      click: vi.fn(),
    } as unknown as HTMLAnchorElement)

    downloadTextFile('content', 'My Company', 'Senior Role')
    expect(downloadAttr).toBe('cover-letter-my-company-senior-role.txt')
  })
})

describe('readFileAsBase64', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resolves with base64 data from a file', async () => {
    const mockFile = new File(['test content'], 'cv.pdf', { type: 'application/pdf' })

    class MockFileReader {
      onload: ((e: ProgressEvent<FileReader>) => void) | null = null
      onerror: ((e: ProgressEvent<FileReader>) => void) | null = null
      result = 'data:application/pdf;base64,dGVzdA=='
      readAsDataURL() {
        setTimeout(() => {
          this.onload?.({ target: this } as unknown as ProgressEvent<FileReader>)
        }, 0)
      }
    }

    vi.stubGlobal('FileReader', MockFileReader)

    const result = await readFileAsBase64(mockFile)
    expect(result).toBe('dGVzdA==')
  })

  it('rejects when FileReader errors', async () => {
    const mockFile = new File([''], 'bad.pdf', { type: 'application/pdf' })

    class MockFileReaderError {
      onload: unknown = null
      onerror: ((e: ProgressEvent<FileReader>) => void) | null = null
      result = null
      readAsDataURL() {
        setTimeout(() => {
          this.onerror?.({} as ProgressEvent<FileReader>)
        }, 0)
      }
    }

    vi.stubGlobal('FileReader', MockFileReaderError)

    await expect(readFileAsBase64(mockFile)).rejects.toThrow('File read error')
  })
})
