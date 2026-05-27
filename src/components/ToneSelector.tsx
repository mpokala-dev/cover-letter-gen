import type { Tone } from '../types/index.ts'
import { TONES } from '../types/index.ts'

interface ToneSelectorProps {
  value: Tone
  onChange: (tone: Tone) => void
  disabled?: boolean
}

const TONE_LABELS: Record<Tone, string> = {
  formal: 'Formal',
  friendly: 'Friendly',
  bold: 'Bold',
}

export function ToneSelector({ value, onChange, disabled = false }: ToneSelectorProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium tracking-widest text-gray-500 uppercase">Tone</p>
      <div className="flex gap-2" role="group" aria-label="Letter tone">
        {TONES.map((tone) => (
          <button
            key={tone}
            type="button"
            disabled={disabled}
            aria-pressed={value === tone}
            onClick={() => onChange(tone)}
            className={[
              'flex-1 rounded-lg border py-2 text-sm transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900',
              'disabled:cursor-not-allowed disabled:opacity-40',
              value === tone
                ? 'border-gray-900 bg-gray-900 font-medium text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900',
            ].join(' ')}
          >
            {TONE_LABELS[tone]}
          </button>
        ))}
      </div>
    </div>
  )
}
