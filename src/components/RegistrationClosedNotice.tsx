import { CalendarClock } from 'lucide-react'
import { REGISTRATION_CLOSED_MESSAGE, REGISTRATION_CLOSED_TITLE } from '../data/registration'

interface RegistrationClosedNoticeProps {
  compact?: boolean
  className?: string
}

export default function RegistrationClosedNotice({
  compact = false,
  className = '',
}: RegistrationClosedNoticeProps) {
  return (
    <div
      role="status"
      className={`rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-secondary/5 text-center ${
        compact ? 'p-5' : 'p-6 sm:p-8'
      } ${className}`}
    >
      <div
        className={`mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary ${
          compact ? 'mb-3 h-11 w-11' : 'mb-4 h-14 w-14'
        }`}
      >
        <CalendarClock size={compact ? 20 : 26} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h4 className="font-display text-lg font-bold text-navy">{REGISTRATION_CLOSED_TITLE}</h4>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
        {REGISTRATION_CLOSED_MESSAGE}
      </p>
    </div>
  )
}
