import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, Camera } from 'lucide-react'
import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import { GALLERY_SECTIONS } from '../data/content'

export default function Gallery() {
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <>
      <PageHero
        title="Gallery"
        subtitle="GET READY TO GIVE YOURSELF TO CHRIST"
        background="/images/background/GALLERY-BG-IMG.jpg"
      />

      <section className="py-24 md:py-32 section-mesh">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {GALLERY_SECTIONS.map((section) => (
            <div key={section.title}>
              <SectionHeading label="Indian Youth Conference" title={section.title} />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {section.images.map((src, i) => (
                  <motion.button
                    key={src}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    onClick={() => setLightbox(src)}
                    className={`group relative rounded-2xl overflow-hidden cursor-pointer card-hover ${
                      i === 0 ? 'md:col-span-2 md:row-span-2 aspect-square md:aspect-auto md:min-h-[400px]' : 'aspect-[4/3]'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${section.title} photo ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement
                        el.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23e1137b10" width="400" height="300"/><text x="50%" y="50%" fill="%23060818" font-size="14" text-anchor="middle" dy=".3em" font-family="sans-serif">IYC Photo</text></svg>`)}`
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-end justify-between p-4">
                      <div className="flex items-center gap-2 text-white text-xs">
                        <Camera size={14} />
                        <span>View</span>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <ZoomIn size={16} className="text-white" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-navy/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-5 right-5 w-10 h-10 rounded-full glass-card-dark text-white hover:bg-white/20 flex items-center justify-center transition-all"
              onClick={() => setLightbox(null)}
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              src={lightbox}
              alt="Gallery preview"
              className="max-w-full max-h-[88vh] rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
