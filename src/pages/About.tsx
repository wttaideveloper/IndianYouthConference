import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Calendar, MapPin, Compass, Sparkles } from "lucide-react";
import PageHero from "../components/PageHero";
import SectionHeading from "../components/SectionHeading";
import Button from "../components/Button";
import MapEmbed from "../components/MapEmbed";
import { FEATURES, EVENT } from "../data/content";

const TABS = [
  { id: "date" as const, label: "Date", icon: Calendar },
  { id: "venue" as const, label: "Venue", icon: MapPin },
  { id: "guide" as const, label: "Guide", icon: Compass },
];

export default function About() {
  const [activeTab, setActiveTab] = useState<"date" | "venue" | "guide">(
    "venue",
  );

  return (
    <>
      <PageHero
        title="About Us"
        subtitle="GET READY TO GIVE YOURSELF TO CHRIST"
        background="/images/background/CONTACT-BG-IMG.jpg"
      />

      <section className="py-24 md:py-32 section-mesh">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeading
                label="Indian Youth Conference"
                title="Know About Us"
                align="left"
              />
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
                    <h4 className="font-display font-bold text-navy mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {feature.description}
                    </p>
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
              <div className="relative overflow-hidden rounded-3xl shadow-2xl section-dark min-h-[420px] sm:min-h-[480px] lg:min-h-[560px] p-6 sm:p-10 flex flex-col justify-between">
                <div className="orb orb-pink w-72 h-72 -top-24 -right-24 opacity-60" />
                <div className="orb orb-orange w-64 h-64 -bottom-24 -left-20 opacity-50" />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #fff 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                  }}
                />
                <svg
                  aria-hidden="true"
                  className="absolute -top-20 -right-20 h-80 w-80 text-white/10"
                  viewBox="0 0 200 200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <circle cx="100" cy="100" r="95" />
                  <circle cx="100" cy="100" r="72" />
                  <circle cx="100" cy="100" r="49" />
                  <circle cx="100" cy="100" r="26" />
                </svg>

                <div className="relative">
                  <span className="label-pill label-pill-light">
                    IYC {EVENT.year}
                  </span>
                  <h3 className="mt-5 font-display text-4xl sm:text-5xl font-bold leading-[1.1] text-white">
                    Empower.
                    <br />
                    Inspire.
                    <br />
                    <span className="gradient-text">Lead.</span>
                  </h3>
                </div>

                <div className="relative mt-10 grid grid-cols-1 gap-3">
                  {[
                    { icon: Calendar, label: "Dates", value: EVENT.dates },
                    { icon: MapPin, label: "Venue", value: EVENT.mapTitle },
                    { icon: Sparkles, label: "Since", value: "2015" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="glass-card-dark flex items-center gap-4 rounded-2xl px-4 py-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/25">
                        <Icon size={18} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-widest text-white/40">
                          {label}
                        </p>
                        <p className="text-sm font-semibold leading-snug text-white">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                  title: "THE IYC ACTION PLAN!",
                  text: "To organize regional and national conferences across different parts of India, bringing young people together to learn practical outreach methods, exchange experiences, develop leadership skills, and inspire one another. To coordinate community engagement and outreach initiatives that provide young people with hands-on experience in making a positive difference in society.",
                },
                {
                  title: "WHAT IYC CARES FOR!",
                  text: "To engage, empower, and equip young people through diverse programmes, workshops, and initiatives that develop their skills, nurture their leadership potential, encourage active community participation, and inspire them to lead purposeful and meaningful lives.",
                },
              ].map((block) => (
                <div key={block.title} className="mb-8">
                  <h3
                    className="font-display text-2xl font-bold mb-4"
                    style={{
                      background: "linear-gradient(135deg,#ffc107,#ff8a01)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {block.title}
                  </h3>
                  <p className="text-white/65 leading-relaxed text-sm">
                    {block.text}
                  </p>
                </div>
              ))}
              <Button to="/register" variant="glass" size="lg">
                Register Now
              </Button>
            </motion.div>
          </div>
          <div
            className="min-h-[300px] lg:min-h-full bg-cover bg-center relative"
            style={{
              backgroundImage: "url(/images/resource/ABOUT-second.jpg)",
            }}
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
              <SectionHeading
                label="Reach us"
                title="Get Directions"
                align="left"
              />
              <div className="flex gap-2 mb-8 flex-wrap">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20"
                          : "glass-card text-gray-600 hover:shadow-md"
                      }`}
                    >
                      <Icon size={15} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6"
              >
                {activeTab === "date" && (
                  <>
                    <h4 className="font-display font-bold text-navy mb-3">
                      When is the Date
                    </h4>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Mark your calendars for{" "}
                      <span className="font-semibold text-primary">
                        {EVENT.dates}.
                      </span>{" "}
                      Save the date and get ready for an unforgettable
                      experience.
                    </p>
                  </>
                )}
                {activeTab === "venue" && (
                  <>
                    <h4 className="font-display font-bold text-navy mb-3">
                      Where is the Venue
                    </h4>
                    <p className="text-navy font-semibold mb-5">
                      {EVENT.venue}
                    </p>
                    <h5 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                      Contact
                    </h5>
                    <ul className="space-y-3">
                      <li>
                        <a
                          href={`mailto:${EVENT.email}`}
                          className="flex items-center gap-3 text-gray-600 hover:text-primary text-sm transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                            <Mail size={14} className="text-primary" />
                          </div>
                          {EVENT.email}
                        </a>
                      </li>
                    </ul>
                  </>
                )}
                {activeTab === "guide" && (
                  <>
                    <h4 className="font-display font-bold text-navy mb-3">
                      How to Reach Us
                    </h4>
                    <p className="text-gray-500 text-sm">
                      Travel guide information will be updated soon.
                    </p>
                  </>
                )}
              </motion.div>
            </div>
            <MapEmbed className="h-[420px] rounded-3xl" />
          </div>
        </div>
      </section>
    </>
  );
}
