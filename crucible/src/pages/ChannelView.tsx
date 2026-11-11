import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Channel, Message } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import MessageItem from '../components/MessageItem'
import MessageInput from '../components/MessageInput'

interface ChannelViewProps {
  channel: Channel
}

export default function ChannelView({ channel }: ChannelViewProps) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [loadError, setLoadError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadMessages = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const { data, error } = await supabase
      .from('messages')
      .select(`*, profiles:user_id (display_name, avatar_url), attachments (*)`)
      .eq('channel_id', channel.id)
      .is('parent_id', null)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) {
      setLoadError(error.message)
      setMessages([])
      setLoading(false)
      return
    }

    const withSignedMedia = await Promise.all((data as Message[]).map(async (message) => {
      const attachments = await Promise.all((message.attachments || []).map(async (attachment) => {
        const { data: signed, error: signedError } = await supabase.storage
          .from('attachments')
          .createSignedUrl(attachment.url, 60 * 60)
        return signedError || !signed ? attachment : { ...attachment, url: signed.signedUrl }
      }))
      return { ...message, attachments }
    }))

    setMessages(withSignedMedia)
    setLoading(false)
  }, [channel.id])

  useEffect(() => {
    void loadMessages()
    if (user) {
      void supabase.from('channel_reads').upsert({
        user_id: user.id,
        channel_id: channel.id,
        last_read_at: new Date().toISOString()
      })
    }

    const subscription = supabase
      .channel(`messages:${channel.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channel.id}`
      }, () => { void loadMessages() })
      .subscribe()

    return () => { void supabase.removeChannel(subscription) }
  }, [channel.id, user, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (content: string, files: File[]) => {
    if (!user || !profile) return
    const uploadedPaths: string[] = []

    const cleanupUploads = async () => {
      if (uploadedPaths.length === 0) return
      await supabase.storage.from('attachments').remove(uploadedPaths)
    }

    try {
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          channel_id: channel.id,
          user_id: user.id,
          content,
          parent_id: replyingTo?.id || null
        })
        .select()
        .single()

      if (error) throw error

      if (files.length > 0) {
        const attachments = []
        for (const file of files) {
          const ext = file.name.split('.').pop()
          const path = `${user.id}/${message.id}/${Date.now()}.${ext}`
          const { error: uploadError } = await supabase.storage.from('attachments').upload(path, file)
          if (uploadError) throw uploadError
          uploadedPaths.push(path)
          attachments.push({
            message_id: message.id,
            url: path,
            type: file.type.startsWith('image/') ? 'image' : 'audio',
            filename: file.name,
            size: file.size
          })
        }
        const { error: attachmentError } = await supabase.from('attachments').insert(attachments)
        if (attachmentError) {
          await supabase.from('messages').delete().eq('id', message.id)
          throw new Error(`The message was not saved with its attachments: ${attachmentError.message}`)
        }
      }

      setReplyingTo(null)
      await loadMessages()
    } catch (error) {
      await cleanupUploads()
      throw error
    }
  }

  const canPost = channel.slug !== 'announcements' || profile?.role === 'admin'

  return (
    <div className="flex flex-col h-full">
      <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-bronze/20 bg-charcoal-dark">
        <div>
          <h2 className="text-lg font-medium text-bronze">#{channel.name}</h2>
          {channel.description && <p className="text-sm text-parchment/50">{channel.description}</p>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
        {loading ? (
          <div className="text-center text-parchment/50 py-10">Loading messages...</div>
        ) : loadError ? (
          <div role="alert" className="text-center text-ember py-10">Could not load messages: {loadError}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-parchment/50 py-10">
            <p>No messages yet in #{channel.name}.</p>
            <p className="text-sm mt-1">Be the first to share something.</p>
          </div>
        ) : (
          messages.map(msg => <MessageItem key={msg.id} message={msg} onReply={() => setReplyingTo(msg)} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {replyingTo && (
        <div className="px-4 lg:px-6 py-2 bg-charcoal-light border-t border-bronze/10 flex items-center justify-between text-sm">
          <span className="text-parchment/70">Replying to <span className="text-bronze">{replyingTo.profiles?.display_name || 'someone'}</span></span>
          <button onClick={() => setReplyingTo(null)} className="text-parchment/50 hover:text-parchment">Cancel</button>
        </div>
      )}

      {canPost ? (
        <MessageInput onSend={handleSend} placeholder={replyingTo ? `Reply to ${replyingTo.profiles?.display_name || 'message'}...` : `Message #${channel.name}`} allowAudio={channel.slug === 'the-soundboard'} />
      ) : (
        <div className="px-4 py-4 text-center text-sm text-parchment/50 border-t border-bronze/20">Only administrators can post in #announcements</div>
      )}
    </div>
  )
}
