import { MapPin } from 'lucide-react'
import { EVENT } from '../data/content'

interface MapEmbedProps {
  className?: string
}

export default function MapEmbed({ className = '' }: MapEmbedProps) {
  const src = `https://maps.google.com/maps?q=${EVENT.mapLat},${EVENT.mapLng}&z=14&output=embed`

  return (
    <div className={`relative overflow-hidden shadow-xl border border-white/80 ${className}`}>
      <div className="absolute top-4 left-4 z-10 glass-card rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-lg">
        <MapPin size={14} className="text-primary" />
        <span className="text-navy text-xs font-semibold">{EVENT.venue}</span>
      </div>
      <iframe
        title={EVENT.mapTitle}
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: 400, display: 'block' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}
