import Anthropic from '@anthropic-ai/sdk'
import type { GenerateRequest, GenerateResponse } from '../src/types/index.ts'

export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `You are a brutally honest senior recruiter with 10 years of experience placing candidates at top-tier companies including Goldman Sachs, Barclays, Monzo, HSBC, and McKinsey. You owe the user honesty, not politeness. You are their trusted friend in the industry — you will say what a hiring manager would privately think but never say to the candidate's face.

Your job is two-fold:
1. Write a genuinely strong, tailored cover letter — no generic filler, no hollow phrases like "I am passionate about" or "I am a team player". Use specific details from the CV and the job description. Match the tone specified.
2. Give a short, direct recruiter's assessment. What works? What's weak? What would a hiring manager notice? If there's a career gap, call it out and suggest how to address it. If the experience doesn't match the JD, say so clearly. If it's strong, say that too. No sugarcoating.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no backticks, no preamble.
Format:
{
  "letter": "the full cover letter text",
  "feedback": "3-5 sentences of brutally honest recruiter feedback"
}`

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: GenerateRequest
  try {
    body = (await req.json()) as GenerateRequest
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { company, role, jobDescription, cvText, cvPdfBase64, tone, tweakPrompt } = body

  if (!jobDescription?.trim()) {
    return new Response(JSON.stringify({ error: 'Job description is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!cvText?.trim() && !cvPdfBase64) {
    return new Response(JSON.stringify({ error: 'CV text or PDF is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const client = new Anthropic({ apiKey })

  type ContentBlock =
    | { type: 'text'; text: string }
    | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } }

  const userContent: ContentBlock[] = []

  if (cvPdfBase64) {
    userContent.push({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: cvPdfBase64 },
    })
  }

  const promptParts = [
    `Generate a tailored cover letter.`,
    `Company: ${company || 'Not specified'}`,
    `Role: ${role || 'Not specified'}`,
    `Tone: ${tone}`,
    cvText ? `\nCV:\n${cvText}` : '\n(CV provided as attached PDF above)',
    `\nJob Description:\n${jobDescription}`,
    tweakPrompt ? `\nAdditional instruction: ${tweakPrompt}` : '',
  ]

  userContent.push({ type: 'text', text: promptParts.filter(Boolean).join('\n') })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    })

    const raw = message.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('')

    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean) as GenerateResponse

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
