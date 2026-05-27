export const TONES = ['formal', 'friendly', 'bold'] as const
export type Tone = (typeof TONES)[number]

export interface GenerateRequest {
  company: string
  role: string
  jobDescription: string
  cvText: string
  cvPdfBase64?: string
  tone: Tone
  tweakPrompt?: string
}

export interface GenerateResponse {
  letter: string
  feedback: string
}

export type GenerateStatus = 'idle' | 'loading' | 'success' | 'error'
