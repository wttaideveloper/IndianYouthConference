import { motion } from 'framer-motion'
import { Mail, Shield, Zap, Calendar } from 'lucide-react'
import PageHero from '../components/PageHero'
import RegisterForm from '../components/RegisterForm'
import { EVENT } from '../data/content'
import { REGISTRATION_FEES, PAYMENT_NOTE } from '../data/registration'

export default function Register() {
  return (
    <>
      <PageHero title="Register" subtitle={EVENT.name} />

      <section className="py-24 md:py-32 section-mesh">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="space-y-5 lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-3xl p-6"
              >
                <h3 className="font-display font-bold text-navy mb-4">Event Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Dates</p>
                    <p className="text-navy font-semibold">{EVENT.dates}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Venue</p>
                    <p className="text-navy font-semibold text-sm leading-snug">{EVENT.venue}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-3xl p-6"
              >
                <h3 className="font-display font-bold text-navy mb-4">Registration Fees</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Students / Pastors / Missionary Volunteers</span>
                    <span className="font-bold text-primary">₹{REGISTRATION_FEES.standard}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Working Professionals</span>
                    <span className="font-bold text-primary">₹{REGISTRATION_FEES.working}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Weekend Only</span>
                    <span className="font-bold text-primary">₹{REGISTRATION_FEES.weekend}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 leading-relaxed">{PAYMENT_NOTE}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl p-6 bg-gradient-to-br from-primary/8 to-secondary/8 border border-primary/15"
              >
                {[
                  { icon: Calendar, text: 'Arrival & departure dates required' },
                  { icon: Mail, text: 'Confirmation email after admin verifies payment' },
                  { icon: Shield, text: 'QR payment + screenshot upload' },
                  { icon: Zap, text: 'Payment verified within 48hrs' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 mb-3 last:mb-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-primary" />
                    </div>
                    <span className="text-gray-600 text-sm">{text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3 glass-card rounded-3xl p-6 md:p-10"
            >
              <RegisterForm />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
