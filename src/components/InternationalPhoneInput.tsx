import { useEffect, useState } from 'react'
import PhoneNumberField from './PhoneNumberField'
import {
  DEFAULT_COUNTRY_CALLING_CODE,
  getCountryCallingCodeOption,
  splitInternationalPhone,
  toInternationalPhone,
} from '../data/countryCallingCodes'

interface Props {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

/** Controlled international number field that stores one normalized +countrycode number. */
export default function InternationalPhoneInput({ id, label, value, onChange, error, required }: Props) {
  const [countryCode, setCountryCode] = useState(() =>
    value.startsWith('+') ? splitInternationalPhone(value).countryCode : DEFAULT_COUNTRY_CALLING_CODE,
  )
  const parsed = splitInternationalPhone(value, countryCode)
  const activeCountryCode = value.startsWith('+') ? parsed.countryCode : countryCode
  const localNumber = parsed.localNumber.slice(0, getCountryCallingCodeOption(activeCountryCode)?.maxLength || 15)

  useEffect(() => {
    if (value.startsWith('+')) setCountryCode(splitInternationalPhone(value).countryCode)
  }, [value])

  const handleCountryChange = (nextCountryCode: string) => {
    const maxLength = getCountryCallingCodeOption(nextCountryCode)?.maxLength || 15
    const nextLocalNumber = localNumber.slice(0, maxLength)
    setCountryCode(nextCountryCode)
    onChange(toInternationalPhone(nextCountryCode, nextLocalNumber))
  }

  const handleLocalNumberChange = (input: string) => {
    const international = input.trim().startsWith('+') ? splitInternationalPhone(input, activeCountryCode) : null
    const nextCountryCode = international?.countryCode || activeCountryCode
    const digits = (international?.localNumber || input.replace(/\D/g, '')).slice(
      0,
      getCountryCallingCodeOption(nextCountryCode)?.maxLength || 15,
    )
    setCountryCode(nextCountryCode)
    onChange(toInternationalPhone(nextCountryCode, digits))
  }

  return (
    <PhoneNumberField
      id={id}
      label={label}
      required={required}
      countryCode={activeCountryCode}
      localNumber={localNumber}
      onCountryCodeChange={handleCountryChange}
      onLocalNumberChange={handleLocalNumberChange}
      error={error}
    />
  )
}
