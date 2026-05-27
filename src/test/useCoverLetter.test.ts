import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCoverLetter } from '../hooks/useCoverLetter.ts'
import * as api from '../utils/api.ts'

const mockResult = {
  letter: 'Dear Hiring Manager...',
  feedback: 'Strong application.',
}

describe('useCoverLetter', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('initialises with idle status and no result', () => {
    const { result } = renderHook(() => useCoverLetter())
    expect(result.current.status).toBe('idle')
    expect(result.current.result).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('defaults tone to formal', () => {
    const { result } = renderHook(() => useCoverLetter())
    expect(result.current.form.tone).toBe('formal')
  })

  it('setField updates the form', () => {
    const { result } = renderHook(() => useCoverLetter())
    act(() => result.current.setField('company', 'Monzo'))
    expect(result.current.form.company).toBe('Monzo')
  })

  it('shows error when jobDescription is empty on generate', async () => {
    const { result } = renderHook(() => useCoverLetter())
    await act(async () => result.current.generate())
    expect(result.current.error).toBe('Please paste the job description.')
  })

  it('shows error when CV is missing on generate', async () => {
    const { result } = renderHook(() => useCoverLetter())
    act(() => result.current.setField('jobDescription', 'Some JD text'))
    await act(async () => result.current.generate())
    expect(result.current.error).toBe('Please paste your CV or upload a PDF.')
  })

  it('sets status to success after successful generate', async () => {
    vi.spyOn(api, 'generateCoverLetter').mockResolvedValue(mockResult)
    const { result } = renderHook(() => useCoverLetter())
    act(() => {
      result.current.setField('jobDescription', 'JD text')
      result.current.setField('cvText', 'My CV')
    })
    await act(async () => result.current.generate())
    expect(result.current.status).toBe('success')
    expect(result.current.result).toEqual(mockResult)
  })

  it('sets status to error on API failure', async () => {
    vi.spyOn(api, 'generateCoverLetter').mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useCoverLetter())
    act(() => {
      result.current.setField('jobDescription', 'JD text')
      result.current.setField('cvText', 'My CV')
    })
    await act(async () => result.current.generate())
    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Network error')
  })

  it('regenerate does nothing if generate was never called', async () => {
    const spy = vi.spyOn(api, 'generateCoverLetter')
    const { result } = renderHook(() => useCoverLetter())
    await act(async () => result.current.regenerate())
    expect(spy).not.toHaveBeenCalled()
  })

  it('regenerate uses lastRequest and tweakPrompt', async () => {
    const spy = vi.spyOn(api, 'generateCoverLetter').mockResolvedValue(mockResult)
    const { result } = renderHook(() => useCoverLetter())
    act(() => {
      result.current.setField('jobDescription', 'JD text')
      result.current.setField('cvText', 'My CV')
    })
    await act(async () => result.current.generate())
    act(() => result.current.setField('tweakPrompt', 'make it shorter'))
    await act(async () => result.current.regenerate())
    expect(spy).toHaveBeenCalledTimes(2)
    const secondCall = spy.mock.calls[1][0]
    expect(secondCall.tweakPrompt).toBe('make it shorter')
  })

  it('clears tweakPrompt after regenerate', async () => {
    vi.spyOn(api, 'generateCoverLetter').mockResolvedValue(mockResult)
    const { result } = renderHook(() => useCoverLetter())
    act(() => {
      result.current.setField('jobDescription', 'JD text')
      result.current.setField('cvText', 'My CV')
    })
    await act(async () => result.current.generate())
    act(() => result.current.setField('tweakPrompt', 'shorter'))
    await act(async () => result.current.regenerate())
    expect(result.current.form.tweakPrompt).toBe('')
  })
})
