import { useState, useRef } from 'react'
import { Send, Image, Music, X } from 'lucide-react'

interface MessageInputProps {
  onSend: (content: string, files: File[]) => Promise<void>
  placeholder?: string
  allowAudio?: boolean
}

const MAX_FILE_SIZE = 20 * 1024 * 1024

export default function MessageInput({ onSend, placeholder, allowAudio = false }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const submitMessage = async () => {
    if ((!content.trim() && files.length === 0) || sending) return

    setSending(true)
    setError('')
    try {
      await onSend(content, files)
      setContent('')
      setFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your message could not be sent. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void submitMessage()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const selected = Array.from(e.target.files || [])
    const valid = selected.filter(file => {
      const typeMatches = type === 'image' ? file.type.startsWith('image/') : file.type.startsWith('audio/')
      if (!typeMatches) return false
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} is larger than the 20 MB limit.`)
        return false
      }
      return true
    })
    setFiles(prev => [...prev, ...valid])
    e.target.value = ''
  }

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index))

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-bronze/20 bg-charcoal-dark">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center gap-2 bg-charcoal-light px-3 py-1.5 rounded-lg text-sm">
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button type="button" onClick={() => removeFile(i)} className="text-parchment/50 hover:text-ember" aria-label={`Remove ${file.name}`}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-parchment/50 hover:text-bronze hover:bg-charcoal-light rounded-lg" title="Attach image" aria-label="Attach image">
            <Image size={18} />
          </button>
          {allowAudio && (
            <button type="button" onClick={() => audioInputRef.current?.click()} className="p-2.5 text-parchment/50 hover:text-bronze hover:bg-charcoal-light rounded-lg" title="Attach audio" aria-label="Attach audio">
              <Music size={18} />
            </button>
          )}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={1}
          className="flex-1 px-4 py-3 bg-charcoal-light border border-bronze/20 rounded-xl text-parchment placeholder:text-parchment/30 focus:outline-none focus:border-bronze/50 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void submitMessage()
            }
          }}
        />

        <button type="submit" disabled={sending || (!content.trim() && files.length === 0)} className="p-3 bg-bronze text-charcoal rounded-xl hover:bg-bronze-light disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Send message">
          <Send size={18} />
        </button>
      </div>

      {error && <p role="alert" className="text-ember text-xs mt-2">{error}</p>}

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple className="hidden" onChange={(e) => handleFileSelect(e, 'image')} />
      {allowAudio && <input ref={audioInputRef} type="file" accept="audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/ogg,audio/webm,audio/x-m4a" multiple className="hidden" onChange={(e) => handleFileSelect(e, 'audio')} />}
    </form>
  )
}
