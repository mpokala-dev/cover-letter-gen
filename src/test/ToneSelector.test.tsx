import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToneSelector } from '../components/ToneSelector.tsx'

describe('ToneSelector', () => {
  it('renders all three tone options', () => {
    render(<ToneSelector value="formal" onChange={vi.fn()} />)
    expect(screen.getByText('Formal')).toBeInTheDocument()
    expect(screen.getByText('Friendly')).toBeInTheDocument()
    expect(screen.getByText('Bold')).toBeInTheDocument()
  })

  it('marks the current tone as pressed', () => {
    render(<ToneSelector value="friendly" onChange={vi.fn()} />)
    expect(screen.getByText('Friendly').closest('button')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Formal').closest('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange with the selected tone', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ToneSelector value="formal" onChange={onChange} />)
    await user.click(screen.getByText('Bold'))
    expect(onChange).toHaveBeenCalledWith('bold')
  })

  it('disables all buttons when disabled prop is true', () => {
    render(<ToneSelector value="formal" onChange={vi.fn()} disabled />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => expect(btn).toBeDisabled())
  })

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ToneSelector value="formal" onChange={onChange} disabled />)
    await user.click(screen.getByText('Bold'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
