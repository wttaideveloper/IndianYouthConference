import { COUNTRY_CALLING_CODE_OPTIONS } from '../data/countryCallingCodes'

interface Props {
  id: string
  label: string
  required?: boolean
  countryCode: string
  localNumber: string
  onCountryCodeChange: (value: string) => void
  onLocalNumberChange: (value: string) => void
  error?: string
}

export default function PhoneNumberField({
  id,
  label,
  required = false,
  countryCode,
  localNumber,
  onCountryCodeChange,
  onLocalNumberChange,
  error,
}: Props) {
  const errorId = `${id}-error`
  const controlClass = error
    ? 'border-red-400 ring-2 ring-red-100 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10'
    : 'border-[#e8eaf2] focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10'

  return (
    <div>
      <label htmlFor={`${id}-local-number`} className="text-xs font-medium text-gray-500 mb-1.5 block">
        {label}{required ? ' *' : ''}
      </label>
      <div className={`flex h-[52px] min-w-0 overflow-hidden rounded-[0.875rem] border-[1.5px] bg-white/90 transition-all ${controlClass}`}>
        <select
          id={`${id}-country-code`}
          aria-label={`${label} country code`}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          value={countryCode}
          onChange={(event) => onCountryCodeChange(event.target.value)}
          className="w-20 sm:w-24 shrink-0 border-0 rounded-none bg-transparent px-2 text-sm text-gray-700 outline-none focus:outline-none"
        >
          {COUNTRY_CALLING_CODE_OPTIONS.map(({ code }) => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>
        <div aria-hidden="true" className="my-2 w-px shrink-0 bg-gray-200" />
        <input
          id={`${id}-local-number`}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          aria-label={`${label} local number`}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          value={localNumber}
          onChange={(event) => onLocalNumberChange(event.target.value)}
          placeholder="Phone number"
          pattern="[0-9]*"
          className="min-w-0 flex-1 border-0 rounded-none bg-transparent px-[1.125rem] text-sm outline-none placeholder:text-[#a0a8be] focus:outline-none"
        />
      </div>
      {error && <p id={errorId} className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  )
}
