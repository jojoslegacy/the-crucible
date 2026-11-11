import type { Message } from '../lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { Reply, Pin } from 'lucide-react'

interface MessageItemProps {
  message: Message
  onReply: () => void
}

export default function MessageItem({ message, onReply }: MessageItemProps) {
  return (
    <div className="group px-4 py-3 hover:bg-charcoal-light/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-bronze/30 flex-shrink-0 flex items-center justify-center text-sm font-medium">
          {message.profiles?.display_name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-medium text-parchment">{message.profiles?.display_name || 'Unknown'}</span>
            <span className="text-xs text-parchment/40">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
            {message.is_pinned && <Pin size={12} className="text-bronze" />}
          </div>
          <div className="text-parchment/90 whitespace-pre-wrap break-words">{message.content}</div>
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.attachments.map(att => (
                <div key={att.id} className="text-xs text-bronze">
                  {att.type === 'image' ? (
                    <img src={att.url} alt={att.filename} className="max-w-xs rounded border border-bronze/20" />
                  ) : (
                    <audio controls src={att.url} className="max-w-xs" />
                  )}
                </div>
              ))}
            </div>
          )}
          <button onClick={onReply} className="mt-1 opacity-0 group-hover:opacity-100 text-xs text-parchment/50 hover:text-bronze flex items-center gap-1 transition-opacity">
            <Reply size={12} /> Reply
          </button>
        </div>
      </div>
    </div>
  )
}
