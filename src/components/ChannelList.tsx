import type { Channel } from '../lib/supabase'

interface ChannelListProps {
  channels: Channel[]
  currentChannel: Channel | null
  onSelect: (channel: Channel) => void
}

export default function ChannelList({ channels, currentChannel, onSelect }: ChannelListProps) {
  const groups = [
    { title: 'START HERE', slugs: ['welcome', 'announcements'] },
    { title: 'THE COMMUNITY', slugs: ['the-gathering', 'the-forge', 'the-soundboard', 'the-embers'] }
  ]

  return (
    <nav className="flex-1 overflow-y-auto py-3">
      {groups.map(group => (
        <div key={group.title} className="mb-4">
          <div className="px-5 py-1 text-[11px] font-medium text-parchment/40 tracking-widest">
            {group.title}
          </div>
          {channels
            .filter(c => group.slugs.includes(c.slug))
            .map(channel => (
              <button
                key={channel.id}
                onClick={() => onSelect(channel)}
                className={`
                  w-full text-left px-5 py-2.5 text-sm transition-colors
                  ${currentChannel?.id === channel.id
                    ? 'bg-bronze/15 text-bronze border-r-2 border-bronze'
                    : 'text-parchment/70 hover:bg-charcoal-light hover:text-parchment'
                  }
                `}
              >
                #{channel.name}
              </button>
            ))}
        </div>
      ))}
    </nav>
  )
}
