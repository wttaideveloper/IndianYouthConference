import { motion } from 'framer-motion'
import { Phone, Facebook, Youtube, Users } from 'lucide-react'
import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import ContactForm from '../components/ContactForm'
import MapEmbed from '../components/MapEmbed'
import { COORDINATORS, EVENT, SOCIAL } from '../data/content'

export default function Contact() {
  const core = COORDINATORS.filter((c) => c.role === 'Core Committee')
  const working = COORDINATORS.filter((c) => c.role === 'Working Committee')

  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="GET READY TO GIVE YOURSELF TO CHRIST"
        background="/images/background/CONTACT-BG-IMG.jpg"
      />

      <section className="py-24 md:py-32 section-mesh">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Our Team"
            title="Our Co-ordinators"
            subtitle="Always there to guide, serve & support you with your evangelistic & spiritual needs"
          />

          {[
            { label: 'Core Committee', members: core },
            { label: 'Working Committee', members: working },
          ].map((group) => (
            <div key={group.label} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center">
                  <Users size={18} className="text-primary" />
                </div>
                <h3 className="font-display font-bold text-navy text-lg">{group.label}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.members.map((coord, i) => (
                  <motion.div
                    key={coord.name}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-card rounded-2xl p-5 card-hover group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm mb-4">
                      {coord.name.charAt(0)}
                    </div>
                    <h5 className="font-semibold text-navy mb-1 group-hover:text-primary transition-colors">{coord.name}</h5>
                    <p className="text-primary/70 text-xs font-medium mb-3 uppercase tracking-wider">{coord.role}</p>
                    {coord.phone && (
                      <a
                        href={`tel:${coord.phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-2 text-gray-400 hover:text-primary text-sm transition-colors"
                      >
                        <Phone size={13} />
                        {coord.phone}
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 section-mesh bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <SectionHeading label="Contact Us" title="Get in Touch" align="left" />
              <div className="glass-card rounded-3xl p-6 md:p-8">
                <ContactForm />
              </div>
            </div>
            <div className="space-y-5">
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
              <div className="rounded-3xl p-6 bg-gradient-to-br from-navy to-navy-light text-white relative overflow-hidden">
                <div className="orb orb-pink w-40 h-40 -top-10 -right-10 opacity-30" />
                <h3 className="font-display font-bold mb-3 relative">Call for Support</h3>
                <p className="text-white/60 text-sm mb-5 relative">
                  Feel free to reach out with any questions.
                </p>
                <a
                  href={`tel:${EVENT.contactSupportPhone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 font-semibold hover:underline relative"
                >
                  <Phone size={16} />
                  {EVENT.contactSupportPhone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MapEmbed className="h-[450px] rounded-3xl" />
        </div>
      </section>
    </>
  )
}
