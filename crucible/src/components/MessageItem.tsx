import { type Message } from '../lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { Reply, Pin } from 'lucide-react'

interface MessageItemProps {
  message: Message
  onReply: () => void
}

export default function MessageItem({ message, onReply }: MessageItemProps) {
  const displayName = message.profiles?.display_name || 'Unknown'
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true })

  return (
    <div className="group py-3 hover:bg-charcoal-light/50 px-2 -mx-2 rounded-lg transition-colors">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-bronze/20 flex items-center justify-center text-sm font-medium flex-shrink-0">
          {displayName[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-parchment">{displayName}</span>
            <span className="text-xs text-parchment/40">{timeAgo}</span>
            {message.is_pinned && (
              <Pin size={12} className="text-bronze" />
            )}
          </div>
          
          {message.content && (
            <div className="mt-1 text-parchment/90 whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </div>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map(att => (
                att.type === 'image' ? (
                  <img
                    key={att.id}
                    src={att.url}
                    alt={att.filename}
                    className="max-w-sm rounded-lg border border-bronze/20"
                  />
                ) : (
                  <div key={att.id} className="max-w-sm">
                    <audio controls className="w-full" src={att.url}>
                      Your browser does not support audio playback.
                    </audio>
                    <div className="text-xs text-parchment/50 mt-1">{att.filename}</div>
                  </div>
                )
              ))}
            </div>
          )}

          <div className="mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onReply}
              className="flex items-center gap-1 text-xs text-parchment/50 hover:text-bronze"
            >
              <Reply size={12} />
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
