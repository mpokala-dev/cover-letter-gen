import { useState } from 'react'
import type { GenerateResponse, Tone } from '../types/index.ts'
import { wordCount, readingTimeMinutes, downloadTextFile } from '../utils/text.ts'

interface LetterResultProps {
  result: GenerateResponse
  company: string
  role: string
  tone: Tone
  tweakPrompt: string
  onTweakChange: (value: string) => void
  onRegenerate: () => void
  isLoading: boolean
}

export function LetterResult({
  result,
  company,
  role,
  tone,
  tweakPrompt,
  onTweakChange,
  onRegenerate,
  isLoading,
}: LetterResultProps) {
  const [copied, setCopied] = useState(false)

  const wc = wordCount(result.letter)
  const rt = readingTimeMinutes(result.letter)

  async function handleCopy() {
    await navigator.clipboard.writeText(result.letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const TONE_LABELS: Record<Tone, string> = { formal: 'Formal', friendly: 'Friendly', bold: 'Bold' }

  return (
    <section aria-label="Generated cover letter" className="mt-8 border-t border-gray-100 pt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-medium text-gray-900">Your cover letter</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
          >
            {copied ? '✓ Copied' : '⎘ Copy'}
          </button>
          <button
            type="button"
            onClick={() => downloadTextFile(result.letter, company, role)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
          >
            ↓ Download
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 px-6 py-5">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{result.letter}</p>
      </div>

      <div className="mt-3 flex gap-2">
        <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-0.5 text-xs text-gray-500">
          {wc} words
        </span>
        <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-0.5 text-xs text-gray-500">
          {rt} min read
        </span>
        <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-0.5 text-xs text-gray-500">
          {TONE_LABELS[tone]} tone
        </span>
      </div>

      {result.feedback && (
        <div
          role="note"
          aria-label="Recruiter feedback"
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4"
        >
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium tracking-widest text-amber-700 uppercase">
            <span aria-hidden="true">⚠</span> Recruiter's honest take
          </p>
          <p className="text-sm leading-relaxed text-amber-800">{result.feedback}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={tweakPrompt}
          onChange={(e) => onTweakChange(e.target.value)}
          placeholder="Tweak… e.g. make it shorter, lead with leadership experience"
          disabled={isLoading}
          className="h-9 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:opacity-40"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) onRegenerate()
          }}
        />
        <button
          type="button"
          disabled={isLoading}
          onClick={onRegenerate}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↻ Regenerate
        </button>
      </div>
    </section>
  )
}
