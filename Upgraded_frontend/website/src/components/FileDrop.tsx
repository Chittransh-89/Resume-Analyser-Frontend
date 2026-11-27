import { useRef, useState, type DragEvent } from 'react'
import { FileText, Upload, X } from './icons'

interface FileDropProps {
  id: string
  label: string
  hint?: string
  file: File | null
  onFile: (file: File | null) => void
  onError?: (message: string) => void
  disabled?: boolean
}

const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx']
const MAX_BYTES = 10 * 1024 * 1024

function validateFile(file: File): string | null {
  const name = file.name.toLowerCase()
  if (!ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return 'Choose a PDF, DOC, or DOCX file.'
  }
  if (file.size > MAX_BYTES) {
    return 'The file must be 10 MB or smaller.'
  }
  return null
}

const FileDrop = ({ id, label, hint, file, onFile, onError, disabled }: FileDropProps) => {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = (next: File) => {
    const error = validateFile(next)
    if (error) {
      onError?.(error)
      return
    }
    onError?.('')
    onFile(next)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    if (disabled) return
    const next = event.dataTransfer.files?.[0]
    if (next) accept(next)
  }

  return (
    <div
      className={`rounded-card border bg-surface transition-colors ${
        dragging ? 'border-cyan bg-cyan/5' : 'border-line'
      } ${disabled ? 'opacity-60' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept=".pdf,.doc,.docx"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          const next = event.target.files?.[0]
          if (next) accept(next)
          event.target.value = ''
        }}
      />

      <label
        htmlFor={id}
        className={`flex items-center gap-3 p-4 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-3 text-cyan"
          aria-hidden="true"
        >
          <Upload size={18} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">{label}</span>
          <span className="mt-0.5 block text-xs text-muted">
            {hint ?? 'PDF, DOC, or DOCX · up to 10 MB'}
          </span>
        </span>
      </label>

      {file && (
        <div className="flex items-center gap-2 border-t border-line px-4 py-3">
          <FileText size={16} className="shrink-0 text-cyan" />
          <span className="min-w-0 flex-1 truncate text-sm text-ink-soft" title={file.name}>
            {file.name}
          </span>
          <button
            type="button"
            className="btn btn-quiet min-h-0 shrink-0 px-2 py-1 text-xs"
            onClick={() => {
              onFile(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
            disabled={disabled}
            aria-label={`Remove ${file.name}`}
          >
            <X size={14} />
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

export default FileDrop
