import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LetterResult } from '../components/LetterResult.tsx'
import type { GenerateResponse } from '../types/index.ts'

const mockResult: GenerateResponse = {
  letter: 'Dear Hiring Manager, I am excited to apply for this role.',
  feedback: 'Your CV is solid but the gap needs addressing in the letter.',
}

const defaultProps = {
  result: mockResult,
  company: 'Monzo',
  role: 'Senior Frontend Developer',
  tone: 'formal' as const,
  tweakPrompt: '',
  onTweakChange: vi.fn(),
  onRegenerate: vi.fn(),
  isLoading: false,
}

describe('LetterResult', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the cover letter text', () => {
    render(<LetterResult {...defaultProps} />)
    expect(screen.getByText(mockResult.letter)).toBeInTheDocument()
  })

  it('renders recruiter feedback', () => {
    render(<LetterResult {...defaultProps} />)
    expect(screen.getByText(mockResult.feedback)).toBeInTheDocument()
  })

  it('shows word count stat', () => {
    render(<LetterResult {...defaultProps} />)
    expect(screen.getByText(/words/i)).toBeInTheDocument()
  })

  it('shows tone badge', () => {
    render(<LetterResult {...defaultProps} />)
    expect(screen.getByText('Formal tone')).toBeInTheDocument()
  })

  it('copies letter to clipboard on Copy click', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
    })
    render(<LetterResult {...defaultProps} />)
    await user.click(screen.getByText(/copy/i))
    expect(writeText).toHaveBeenCalledWith(mockResult.letter)
  })

  it('calls onRegenerate when Regenerate button clicked', async () => {
    const user = userEvent.setup()
    const onRegenerate = vi.fn()
    render(<LetterResult {...defaultProps} onRegenerate={onRegenerate} />)
    await user.click(screen.getByText(/regenerate/i))
    expect(onRegenerate).toHaveBeenCalled()
  })

  it('disables Regenerate button while loading', () => {
    render(<LetterResult {...defaultProps} isLoading />)
    expect(screen.getByText(/regenerate/i)).toBeDisabled()
  })

  it('calls onRegenerate on Enter key in tweak input', async () => {
    const user = userEvent.setup()
    const onRegenerate = vi.fn()
    render(<LetterResult {...defaultProps} onRegenerate={onRegenerate} />)
    const input = screen.getByPlaceholderText(/tweak/i)
    await user.click(input)
    await user.keyboard('{Enter}')
    expect(onRegenerate).toHaveBeenCalled()
  })

  it('calls onTweakChange when typing in tweak input', async () => {
    const user = userEvent.setup()
    const onTweakChange = vi.fn()
    render(<LetterResult {...defaultProps} onTweakChange={onTweakChange} />)
    const input = screen.getByPlaceholderText(/tweak/i)
    await user.type(input, 'shorter')
    expect(onTweakChange).toHaveBeenCalled()
  })

  it('does not show feedback section when feedback is empty', () => {
    render(<LetterResult {...defaultProps} result={{ ...mockResult, feedback: '' }} />)
    expect(screen.queryByText("Recruiter's honest take")).not.toBeInTheDocument()
  })
})
