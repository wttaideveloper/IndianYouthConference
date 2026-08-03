import { useRef } from 'react'
import { QrCode, Upload, X, ImageIcon, Building2, Info, AlertCircle, CreditCard, Clock } from 'lucide-react'
import { DONATION } from '../data/content'
import { PAYMENT_NOTE } from '../data/registration'

interface PaymentSectionProps {
  fee?: number
  screenshot: File | null
  preview: string | null
  paymentOption: 'pay_now' | 'pay_later'
  onPaymentOptionChange: (option: 'pay_now' | 'pay_later') => void
  onScreenshotChange: (file: File | null, preview: string | null) => void
  error?: string
}

const PAY_OPTIONS = [
  { value: 'pay_now' as const, label: 'Pay Now', icon: CreditCard, hint: 'Upload payment proof now' },
  { value: 'pay_later' as const, label: 'Pay Later', icon: Clock, hint: 'Reserve your seat, pay later' },
]

export default function PaymentSection({
  fee,
  screenshot,
  preview,
  paymentOption,
  onPaymentOptionChange,
  onScreenshotChange,
  error,
}: PaymentSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | null) => {
    if (!file) {
      onScreenshotChange(null, null)
      return
    }
    if (!file.type.startsWith('image/')) return
    if (file.size > 10 * 1024 * 1024) return
    onScreenshotChange(file, URL.createObjectURL(file))
  }

  const removeScreenshot = () => {
    if (preview) URL.revokeObjectURL(preview)
    onScreenshotChange(null, null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {PAY_OPTIONS.map(({ value, label, icon: Icon, hint }) => (
          <button
            key={value}
            type="button"
            onClick={() => onPaymentOptionChange(value)}
            className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
              paymentOption === value
                ? 'border-primary bg-primary/5 ring-2 ring-primary/15'
                : 'border-gray-200 bg-white hover:border-primary/30'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${paymentOption === value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
              <Icon size={17} />
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
            </div>
          </button>
        ))}
      </div>

      {paymentOption === 'pay_now' && (
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/15 p-5">
        <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-white/80 border border-primary/10">
          <Info size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed">{PAYMENT_NOTE}</p>
        </div>

        {fee !== undefined && (
          <p className="text-sm font-semibold text-navy mb-4">
            Your registration fee: <span className="text-primary font-display text-xl">₹{fee}</span>
          </p>
        )}

        <p className="text-sm text-gray-600 leading-relaxed mb-4">{DONATION.upiNote}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3 self-start">
              <QrCode size={16} className="text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Scan & Pay</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 inline-flex">
              <img
                src={DONATION.qrCode}
                alt="IYC Payment QR Code — boim-855030150369@boi"
                className="block w-[min(100%,280px)] h-auto object-contain"
                onError={(e) => {
                  const el = e.target as HTMLImageElement
                  if (DONATION.qrCodeFallback) el.src = DONATION.qrCodeFallback
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={16} className="text-secondary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Bank Transfer</span>
            </div>
            <div className="glass-card rounded-2xl p-4 space-y-2.5 text-sm">
              {[
                ['Account Name', DONATION.accountName],
                ['Account No.', DONATION.accountNo],
                ['Bank', DONATION.bank],
                ['IFSC', DONATION.ifsc],
                ['MICR', DONATION.micr],
                ...(DONATION.upiId ? [['UPI ID', DONATION.upiId] as const] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-1 border-b border-gray-100 last:border-0">
                  <span className="text-gray-400 shrink-0">{label}</span>
                  <span className="text-navy font-medium text-right font-mono text-xs">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {paymentOption === 'pay_later' ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-5 text-center">
          <Clock size={18} className="text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-navy">You chose Pay Later</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            No payment screenshot needed now. Please complete your payment before the event —
            your registration will be confirmed once we receive your payment.
          </p>
        </div>
      ) : (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Upload size={16} className="text-primary" />
          <span className="text-sm font-semibold text-navy">Attach Screenshot of Payment *</span>
        </div>

        {!screenshot ? (
          <label
            className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/3 ${
              error ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ImageIcon size={22} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-navy">Browse Files — upload payment screenshot</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP · Max 10 MB</p>
            </div>
          </label>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
            <img src={preview!} alt="Payment screenshot preview" className="w-full max-h-64 object-contain" />
            <button
              type="button"
              onClick={removeScreenshot}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-navy/80 text-white flex items-center justify-center hover:bg-navy transition-colors"
              aria-label="Remove screenshot"
            >
              <X size={16} />
            </button>
            <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-600 truncate">{screenshot.name}</span>
              <span className="text-xs text-green-600 font-medium shrink-0 ml-2">Ready to submit</span>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <AlertCircle size={12} className="shrink-0" />
            {error}
          </p>
        )}
      </div>
      )}
    </div>
  )
}
