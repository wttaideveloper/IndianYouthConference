import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Calendar, MapPin, Compass } from 'lucide-react'
import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import Button from '../components/Button'
import MapEmbed from '../components/MapEmbed'
import { FEATURES, EVENT } from '../data/content'

const TABS = [
  { id: 'date' as const, label: 'Date', icon: Calendar },
  { id: 'venue' as const, label: 'Venue', icon: MapPin },
  { id: 'guide' as const, label: 'Guide', icon: Compass },
]

export default function About() {
  const [activeTab, setActiveTab] = useState<'date' | 'venue' | 'guide'>('venue')

  return (
    <>
      <PageHero
        title="About Us"
        subtitle="GET READY TO GIVE YOURSELF TO CHRIST"
        background="/images/background/ABOUT-BG-IMG.jpg"
      />

      <section className="py-24 md:py-32 section-mesh">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeading label="Indian Youth Conference" title="Know About Us" align="left" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FEATURES.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-card rounded-2xl p-5 card-hover"
                  >
                    <div className="w-8 h-1 rounded-full bg-gradient-to-r from-primary to-secondary mb-4" />
                    <h4 className="font-display font-bold text-navy mb-2">{feature.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-3xl blur-xl" />
              <img
                src="/images/resource/about-img1.jpg"
                alt="About IYC"
                className="relative rounded-3xl shadow-2xl w-full object-cover img-frame"
                onError={(e) => {
                  const el = e.target as HTMLImageElement
                  el.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect fill="%230d1030" width="400" height="600"/><text x="50%" y="50%" fill="%23ffc107" font-size="20" text-anchor="middle" dy=".3em" font-family="sans-serif">About IYC</text></svg>')
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Action Plan */}
      <section className="relative overflow-hidden section-dark">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
          <div className="p-10 md:p-16 flex flex-col justify-center relative">
            <div className="orb orb-pink w-64 h-64 top-0 left-0 opacity-20" />
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {[
                {
                  title: 'THE IYC ACTION PLAN!',
                  text: 'To conduct Regional and Central conferences in the different parts of India where dedicated youth can come and learn outreach methods and share ministry experiences for the benefit of other attendees. To co-ordinate Evangelism projects to give young people a hands-on experience in ministry.',
                },
                {
                  title: 'WHAT IYC CARES FOR!',
                  text: 'Involve and equip youth in different forms of ministry by having programmes of various methods that educate towards outreach, to experience a sense of God\'s call for their life and encourage them to live their daily lives in accordance to God\'s will.',
                },
              ].map((block) => (
                <div key={block.title} className="mb-8">
                  <h3
                    className="font-display text-2xl font-bold mb-4"
                    style={{ background: 'linear-gradient(135deg,#ffc107,#ff8a01)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    {block.title}
                  </h3>
                  <p className="text-white/65 leading-relaxed text-sm">{block.text}</p>
                </div>
              ))}
              <Button to="/register" variant="glass" size="lg">
                Register Now
              </Button>
            </motion.div>
          </div>
          <div
            className="min-h-[300px] lg:min-h-full bg-cover bg-center relative"
            style={{ backgroundImage: 'url(/images/resource/ABOUT-second.jpg)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-navy/60 to-transparent lg:block hidden" />
          </div>
        </div>
      </section>

      {/* Event Info + Map */}
      <section className="py-24 md:py-32 section-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <SectionHeading label="Reach us" title="Get Directions" align="left" />
              <div className="flex gap-2 mb-8 flex-wrap">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20'
                          : 'glass-card text-gray-600 hover:shadow-md'
                      }`}
                    >
                      <Icon size={15} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6"
              >
                {activeTab === 'date' && (
                  <>
                    <h4 className="font-display font-bold text-navy mb-3">When is the Date</h4>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Mark your calendars for{' '}
                      <span className="font-semibold text-primary">{EVENT.dates}.</span> Save the date
                      and get ready for an unforgettable experience.
                    </p>
                  </>
                )}
                {activeTab === 'venue' && (
                  <>
                    <h4 className="font-display font-bold text-navy mb-3">Where is the Venue</h4>
                    <p className="text-navy font-semibold mb-5">{EVENT.venue}</p>
                    <h5 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Contact</h5>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-gray-600 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center"><Phone size={14} className="text-primary" /></div>
                        Martin Mundu
                      </li>
                      <li>
                        <a href={`tel:${EVENT.contactSupportPhone}`} className="flex items-center gap-3 text-gray-600 hover:text-primary text-sm transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center"><Phone size={14} className="text-primary" /></div>
                          {EVENT.contactSupportPhone}
                        </a>
                      </li>
                      <li>
                        <a href={`mailto:${EVENT.email}`} className="flex items-center gap-3 text-gray-600 hover:text-primary text-sm transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center"><Mail size={14} className="text-primary" /></div>
                          {EVENT.email}
                        </a>
                      </li>
                    </ul>
                  </>
                )}
                {activeTab === 'guide' && (
                  <>
                    <h4 className="font-display font-bold text-navy mb-3">How to Reach Us</h4>
                    <p className="text-gray-500 text-sm">Travel guide information will be updated soon.</p>
                  </>
                )}
              </motion.div>
            </div>
            <MapEmbed className="h-[420px] rounded-3xl" />
          </div>
        </div>
      </section>
    </>
  )
}
