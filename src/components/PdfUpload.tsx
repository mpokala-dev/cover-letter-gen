import { useRef } from 'react'

interface PdfUploadProps {
  file: File | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
}

export function PdfUpload({ file, onFileChange, disabled = false }: PdfUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    onFileChange(selected)
    e.target.value = ''
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        id="pdf-upload"
        type="file"
        accept=".pdf"
        className="sr-only"
        disabled={disabled}
        onChange={handleChange}
        aria-label="Upload CV as PDF"
      />
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        className={[
          'cursor-pointer rounded-lg border border-dashed p-4 text-center transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900',
          disabled ? 'cursor-not-allowed opacity-40' : '',
          file
            ? 'border-green-400 bg-green-50'
            : 'border-gray-200 bg-gray-50 hover:border-gray-400',
        ].join(' ')}
      >
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium text-green-700">{file.name}</span>
            <button
              type="button"
              aria-label="Remove PDF"
              onClick={(e) => {
                e.stopPropagation()
                onFileChange(null)
              }}
              className="ml-1 text-green-500 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-1 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <p className="text-sm text-gray-500">Click to upload CV as PDF</p>
          </>
        )}
      </div>
    </div>
  )
}
