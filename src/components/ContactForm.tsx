import { useState, FormEvent } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from './Button'

interface ContactFormProps {
  showSubject?: boolean
  submitLabel?: string
}

export default function ContactForm({ showSubject = true, submitLabel = 'Send Message' }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="text-green-500" size={32} />
        </div>
        <h3 className="font-display font-bold text-navy text-xl mb-2">Message Sent!</h3>
        <p className="text-gray-500 text-sm">Thank you for reaching out. Our team will get back to you shortly.</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" name="name" required placeholder="Your Name *" className="input-modern" />
        <input type="email" name="email" required placeholder="Your Email *" className="input-modern" />
      </div>
      {showSubject && (
        <input type="text" name="subject" required placeholder="Subject *" className="input-modern" />
      )}
      <textarea
        name="message"
        required
        rows={5}
        placeholder="Your Message *"
        className="input-modern resize-none"
      />
      <Button type="submit" variant="primary" className="gap-2">
        <Send size={16} />
        {submitLabel}
      </Button>
    </form>
  )
}
