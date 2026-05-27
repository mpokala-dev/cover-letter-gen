import { useState } from 'react'
import type { GenerateRequest, GenerateResponse, GenerateStatus, Tone } from '../types/index.ts'
import { generateCoverLetter } from '../utils/api.ts'
import { readFileAsBase64 } from '../utils/text.ts'

interface FormState {
  company: string
  role: string
  jobDescription: string
  cvText: string
  cvFile: File | null
  tone: Tone
  tweakPrompt: string
}

interface UseCoverLetterReturn {
  form: FormState
  status: GenerateStatus
  result: GenerateResponse | null
  error: string | null
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void
  generate: () => Promise<void>
  regenerate: () => Promise<void>
}

const initialForm: FormState = {
  company: '',
  role: '',
  jobDescription: '',
  cvText: '',
  cvFile: null,
  tone: 'formal',
  tweakPrompt: '',
}

export function useCoverLetter(): UseCoverLetterReturn {
  const [form, setForm] = useState<FormState>(initialForm)
  const [status, setStatus] = useState<GenerateStatus>('idle')
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastRequest, setLastRequest] = useState<GenerateRequest | null>(null)

  function setField<K extends keyof FormState>(key: K, value: FormState[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function buildRequest(tweakPrompt?: string): Promise<GenerateRequest | null> {
    const { company, role, jobDescription, cvText, cvFile, tone } = form

    if (!jobDescription.trim()) {
      setError('Please paste the job description.')
      return null
    }
    if (!cvText.trim() && !cvFile) {
      setError('Please paste your CV or upload a PDF.')
      return null
    }

    let cvPdfBase64: string | undefined
    if (cvFile) {
      try {
        cvPdfBase64 = await readFileAsBase64(cvFile)
      } catch {
        setError('Failed to read PDF. Please try pasting your CV as text instead.')
        return null
      }
    }

    return { company, role, jobDescription, cvText, cvPdfBase64, tone, tweakPrompt }
  }

  async function generate(): Promise<void> {
    setError(null)
    const request = await buildRequest()
    if (!request) return

    setStatus('loading')
    try {
      const data = await generateCoverLetter(request)
      setResult(data)
      setLastRequest(request)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  async function regenerate(): Promise<void> {
    if (!lastRequest) return
    setError(null)

    const request: GenerateRequest = {
      ...lastRequest,
      tone: form.tone,
      tweakPrompt: form.tweakPrompt || undefined,
    }

    setStatus('loading')
    try {
      const data = await generateCoverLetter(request)
      setResult(data)
      setLastRequest(request)
      setField('tweakPrompt', '')
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return { form, status, result, error, setField, generate, regenerate }
}
