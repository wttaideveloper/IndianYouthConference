import { MapPin } from 'lucide-react'
import { EVENT } from '../data/content'

interface MapEmbedProps {
  className?: string
}

export default function MapEmbed({ className = '' }: MapEmbedProps) {
  const src = `https://maps.google.com/maps?q=${EVENT.mapLat},${EVENT.mapLng}&z=14&output=embed`

  return (
    <div className={`relative overflow-hidden shadow-xl border border-white/80 ${className}`}>
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 max-w-[calc(100%-1.5rem)] sm:max-w-[calc(100%-2rem)] glass-card rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 flex items-start sm:items-center gap-2 shadow-lg">
        <MapPin size={14} className="text-primary shrink-0 mt-0.5 sm:mt-0" />
        <span className="text-navy text-xs font-semibold leading-snug">{EVENT.venue}</span>
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
