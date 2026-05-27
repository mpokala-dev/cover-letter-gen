import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PdfUpload } from '../components/PdfUpload.tsx'

describe('PdfUpload', () => {
  it('renders upload prompt when no file selected', () => {
    render(<PdfUpload file={null} onFileChange={vi.fn()} />)
    expect(screen.getByText('Click to upload CV as PDF')).toBeInTheDocument()
  })

  it('shows filename when file is loaded', () => {
    const file = new File(['content'], 'my-cv.pdf', { type: 'application/pdf' })
    render(<PdfUpload file={file} onFileChange={vi.fn()} />)
    expect(screen.getByText('my-cv.pdf')).toBeInTheDocument()
  })

  it('calls onFileChange with null when remove button clicked', async () => {
    const user = userEvent.setup()
    const onFileChange = vi.fn()
    const file = new File(['content'], 'my-cv.pdf', { type: 'application/pdf' })
    render(<PdfUpload file={file} onFileChange={onFileChange} />)
    await user.click(screen.getByLabelText('Remove PDF'))
    expect(onFileChange).toHaveBeenCalledWith(null)
  })

  it('has aria-disabled when disabled', () => {
    render(<PdfUpload file={null} onFileChange={vi.fn()} disabled />)
    const zone = screen.getByRole('button')
    expect(zone).toHaveAttribute('aria-disabled', 'true')
  })

  it('hidden file input accepts only PDF', () => {
    render(<PdfUpload file={null} onFileChange={vi.fn()} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input.accept).toBe('.pdf')
  })
})
