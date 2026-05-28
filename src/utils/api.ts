import type { GenerateRequest, GenerateResponse } from '../types/index.ts'

export async function generateCoverLetter(
  request: GenerateRequest,
): Promise<GenerateResponse> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  const data = (await res.json()) as GenerateResponse & { error?: string }

  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`)
  }

  return data
}