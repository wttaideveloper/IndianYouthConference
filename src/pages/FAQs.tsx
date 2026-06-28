import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Phone, Facebook, Youtube, HelpCircle } from 'lucide-react'
import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import ContactForm from '../components/ContactForm'
import { FAQS, EVENT, SOCIAL } from '../data/content'

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <>
      <PageHero
        title="FAQs"
        subtitle="GET READY TO GIVE YOURSELF TO CHRIST"
        background="/images/background/about-bg.jpg"
      />

      <section className="py-24 md:py-32 section-mesh">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <SectionHeading
                label="Indian Youth Conference"
                title="Frequently Asked Questions"
                align="left"
              />
              <div className="space-y-3">
                {FAQS.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                      openIndex === i ? 'glass-card glow-primary' : 'glass-card'
                    }`}
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left group"
                    >
                      <div className="flex items-center gap-3 pr-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          openIndex === i ? 'bg-primary text-white' : 'bg-primary/8 text-primary'
                        }`}>
                          <HelpCircle size={16} />
                        </div>
                        <span className="font-semibold text-navy text-sm">{faq.question}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-primary shrink-0 transition-transform duration-300 ${
                          openIndex === i ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {openIndex === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-5 pb-5 pl-16 text-gray-500 text-sm leading-relaxed border-t border-gray-100/80 pt-4">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="glass-card rounded-3xl p-6">
                <h3 className="font-display font-bold text-navy mb-5">Send a Question</h3>
                <ContactForm showSubject={false} submitLabel="Send Question" />
              </div>

              <div className="glass-card rounded-3xl p-6">
                <h3 className="font-display font-bold text-navy mb-4">Follow Us</h3>
                <div className="space-y-3">
                  {[
                    { href: SOCIAL.facebook, icon: Facebook, label: 'Facebook' },
                    { href: SOCIAL.youtube, icon: Youtube, label: 'YouTube' },
                  ].map(({ href, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-gray-600 hover:text-primary transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        <Icon size={16} />
                      </div>
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl p-6 bg-gradient-to-br from-primary via-primary-dark to-secondary text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <h3 className="font-display font-bold mb-3 relative">Call for Support</h3>
                <p className="text-white/75 text-sm mb-5 relative">
                  Our team is here to assist you with any questions.
                </p>
                <a
                  href={`tel:${EVENT.supportPhone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 font-semibold hover:underline relative"
                >
                  <Phone size={16} />
                  {EVENT.supportPhone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
