import { useState, useRef } from 'react'
import { Send, Image, Music, X } from 'lucide-react'

interface MessageInputProps {
  onSend: (content: string, files: File[]) => Promise<void>
  placeholder?: string
  allowAudio?: boolean
}

export default function MessageInput({ onSend, placeholder = 'Write a message...', allowAudio = false }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && files.length === 0) return
    setSending(true)
    setError('')
    try {
      await onSend(content.trim(), files)
      setContent('')
      setFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const selected = Array.from(e.target.files || [])
    const valid = selected.filter(f => {
      if (type === 'image') return f.type.startsWith('image/') && f.size < 5 * 1024 * 1024
      return f.type.startsWith('audio/') && f.size < 10 * 1024 * 1024
    })
    setFiles(prev => [...prev, ...valid].slice(0, 4))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-bronze/20 bg-charcoal-dark p-4">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-charcoal-light rounded text-xs text-parchment/80">
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button type="button" onClick={() => removeFile(i)} className="text-parchment/50 hover:text-ember">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <div className="text-ember text-xs mb-2">{error}</div>}
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-parchment/50 hover:text-bronze hover:bg-charcoal-light rounded"
            title="Attach image"
          >
            <Image size={18} />
          </button>
          {allowAudio && (
            <button
              type="button"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'audio/*'
                input.onchange = (e) => handleFileSelect(e as any, 'audio')
                input.click()
              }}
              className="p-2 text-parchment/50 hover:text-bronze hover:bg-charcoal-light rounded"
              title="Attach audio"
            >
              <Music size={18} />
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'image')}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={1}
          className="flex-1 px-4 py-2.5 bg-charcoal-light border border-bronze/30 rounded-lg text-parchment focus:outline-none focus:border-bronze resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        />
        <button
          type="submit"
          disabled={sending || (!content.trim() && files.length === 0)}
          className="p-2.5 bg-bronze text-charcoal rounded-lg hover:bg-bronze-light disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  )
}
