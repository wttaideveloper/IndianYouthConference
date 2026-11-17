import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import PageHero from "../components/PageHero";
import SectionHeading from "../components/SectionHeading";
import ContactForm from "../components/ContactForm";
import MapEmbed from "../components/MapEmbed";
import { EVENT } from "../data/content";

export default function Contact() {
  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="GET READY TO GIVE YOURSELF TO CHRIST"
        background="/images/background/CONTACT-BG-IMG.jpg"
      />

      <section className="pt-12 pb-10 sm:pt-16 sm:pb-12 md:pt-20 md:pb-14 section-mesh">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <span className="label-pill mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Contact
            </span>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-navy wrap-break-word">
              <span className="gradient-text">
                INDIAN YOUTH CONFERENCE (IYC.)
              </span>
            </h2>
            <div className="glass-card w-fit max-w-full mx-auto mt-6 rounded-2xl overflow-hidden">
              <a
                href={`mailto:${EVENT.email}`}
                aria-label="Email Indian Youth Conference"
                className="group flex min-w-0 items-center justify-center gap-2 px-4 sm:px-6 py-3 text-sm text-gray-600 transition-colors hover:bg-primary/5 hover:text-primary focus-visible:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              >
                <span className="flex w-8 h-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15 text-primary/75 transition-colors group-hover:text-primary group-focus-visible:text-primary">
                  <Mail size={16} aria-hidden="true" />
                </span>
                <span className="break-all">{EVENT.email}</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 section-mesh bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="lg:col-span-2">
              <SectionHeading
                label="Contact Us"
                title="Get in Touch"
                align="left"
              />
              <div className="glass-card rounded-3xl p-6 md:p-8">
                <ContactForm />
              </div>
            </div>
            <div className="space-y-5">
              <div className="rounded-3xl p-6 bg-gradient-to-br from-navy to-navy-light text-white relative overflow-hidden">
                <div className="orb orb-pink w-40 h-40 -top-10 -right-10 opacity-30" />
                <h3 className="font-display font-bold mb-3 relative">
                  Email for Support
                </h3>
                <p className="text-white/60 text-sm mb-5 relative">
                  Feel free to reach out with any questions.
                </p>
                <a
                  href={`mailto:${EVENT.email}`}
                  className="flex items-center gap-2 font-semibold hover:underline relative min-w-0"
                >
                  <Mail size={16} className="shrink-0" />
                  <span className="break-all">{EVENT.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 sm:pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MapEmbed className="h-[400px] md:h-[450px] rounded-2xl sm:rounded-3xl" />
        </div>
      </section>
    </>
  );
}
