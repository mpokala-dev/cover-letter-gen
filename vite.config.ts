/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

function localApiPlugin(): Plugin {
  let apiKey: string | undefined
  return {
    name: 'local-api',
    config(_, { mode }) {
      const env = loadEnv(mode, process.cwd(), '')
      apiKey = env.ANTHROPIC_API_KEY
    },
    configureServer(server) {
      server.middlewares.use('/api/generate', async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405)
          res.end('Method not allowed')
          return
        }

        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Add ANTHROPIC_API_KEY to .env.local' }))
          return
        }

        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))
        req.on('end', async () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString()) as {
              company: string
              role: string
              jobDescription: string
              cvText: string
              cvPdfBase64?: string
              tone: string
              tweakPrompt?: string
            }

            type ContentBlock =
              | { type: 'text'; text: string }
              | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } }

            const userContent: ContentBlock[] = []

            if (body.cvPdfBase64) {
              userContent.push({
                type: 'document',
                source: { type: 'base64', media_type: 'application/pdf', data: body.cvPdfBase64 },
              })
            }

            const promptParts = [
              `Generate a tailored cover letter.`,
              `Company: ${body.company || 'Not specified'}`,
              `Role: ${body.role || 'Not specified'}`,
              `Tone: ${body.tone}`,
              body.cvText ? `\nCV:\n${body.cvText}` : '\n(CV provided as attached PDF above)',
              `\nJob Description:\n${body.jobDescription}`,
              body.tweakPrompt ? `\nAdditional instruction: ${body.tweakPrompt}` : '',
            ]

            userContent.push({ type: 'text', text: promptParts.filter(Boolean).join('\n') })

            const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey as string,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 1500,
                system: `You are a brutally honest senior recruiter with 10 years of experience placing candidates at top-tier companies including Goldman Sachs, Barclays, Monzo, HSBC, and McKinsey. You owe the user honesty, not politeness. You are their trusted friend in the industry — you will say what a hiring manager would privately think but never say to the candidate's face.

Your job is two-fold:
1. Write a genuinely strong, tailored cover letter — no generic filler, no hollow phrases like "I am passionate about" or "I am a team player". Use specific details from the CV and the job description. Match the tone specified.
2. Give a short, direct recruiter's assessment. What works? What's weak? What would a hiring manager notice? If there's a career gap, call it out and suggest how to address it. If the experience doesn't match the JD, say so clearly. If it's strong, say that too. No sugarcoating.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no backticks, no preamble.
Format:
{
  "letter": "the full cover letter text",
  "feedback": "3-5 sentences of brutally honest recruiter feedback"
}`,
                messages: [{ role: 'user', content: userContent }],
              }),
            })

            const data = await anthropicRes.json() as {
              content: Array<{ type: string; text?: string }>
              error?: { message: string }
            }

            if (!anthropicRes.ok) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: data.error?.message ?? 'Anthropic error' }))
              return
            }

            const raw = data.content.map((b) => b.text ?? '').join('')
            const clean = raw.replace(/```json|```/g, '').trim()
            const parsed = JSON.parse(clean) as unknown

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(parsed))
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localApiPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules/', 'src/test/', '*.config.*', 'api/'],
    },
  },
})