import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Policy, PolicyBlock, PolicyContactDetail, PolicyLink } from '../data/policies'

function renderLinkedText(text: string, links?: PolicyLink[]) {
  if (!links?.length) return text

  const matches = links
    .map((link) => ({ ...link, index: text.indexOf(link.text) }))
    .filter((link) => link.index >= 0)
    .sort((a, b) => a.index - b.index)

  if (!matches.length) return text

  const content: ReactNode[] = []
  let cursor = 0

  matches.forEach((link) => {
    if (link.index < cursor) return
    if (link.index > cursor) content.push(text.slice(cursor, link.index))
    content.push(
      <Link
        key={`${link.path}-${link.index}`}
        to={link.path}
        className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
      >
        {link.text}
      </Link>,
    )
    cursor = link.index + link.text.length
  })

  if (cursor < text.length) content.push(text.slice(cursor))
  return content
}

function PolicyDetails({ details }: { details: PolicyContactDetail[] }) {
  return (
    <dl className="divide-y divide-navy/8 rounded-2xl border border-navy/8 bg-white/55">
      {details.map((detail) => (
        <div key={detail.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[7rem_1fr] sm:gap-4 sm:px-5">
          <dt className="font-semibold text-navy text-sm">{detail.label}</dt>
          <dd className="min-w-0 break-words text-sm text-gray-600">
            {detail.href ? (
              <a
                href={detail.href}
                className="text-primary hover:text-secondary underline decoration-primary/35 underline-offset-4 transition-colors rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label={detail.label.includes('Phone') ? `Call ${detail.value}` : `${detail.label} ${detail.value}`}
              >
                {detail.value}
              </a>
            ) : (
              detail.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function PolicyBlockContent({ block }: { block: PolicyBlock }) {
  if (block.type === 'paragraph') return <p>{renderLinkedText(block.text, block.links)}</p>

  if (block.type === 'list') {
    return (
      <ul className="space-y-3 pl-5 list-disc marker:text-primary">
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>{renderLinkedText(item.text, item.links)}</li>
        ))}
      </ul>
    )
  }

  if (block.type === 'details') return <PolicyDetails details={block.details} />

  return (
    <div className="overflow-hidden rounded-2xl border border-navy/8 bg-white/55">
      <table className="w-full table-fixed border-collapse text-left text-sm" aria-label={block.label}>
        <thead className="bg-navy text-white">
          <tr>
            {block.headers.map((header) => (
              <th key={header} scope="col" className="w-1/2 break-words px-4 py-3 font-semibold sm:px-5">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/8">
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="break-words px-4 py-3 align-top text-gray-600 sm:px-5">
                  {cell.href ? (
                    <a
                      href={cell.href}
                      aria-label={cell.ariaLabel}
                      className="text-primary hover:text-secondary underline decoration-primary/35 underline-offset-4 transition-colors rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {cell.text}
                    </a>
                  ) : (
                    cell.text
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PolicyPage({ policy }: { policy: Policy }) {
  useEffect(() => {
    document.title = policy.browserTitle
  }, [policy.browserTitle])

  return (
    <>
      <section className="relative overflow-hidden section-dark pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="orb orb-pink w-72 h-72 -top-28 -left-28 opacity-25" />
        <div className="orb orb-orange w-64 h-64 -bottom-36 right-8 opacity-20" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-sm text-white/60">
            <Link
              to="/"
              className="hover:text-white transition-colors rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Home
            </Link>
            <span aria-hidden="true" className="text-white/35">/</span>
            <span className="text-white/80">{policy.title}</span>
          </nav>
          <span className="label-pill label-pill-light mt-6 mb-4">Policies</span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
            {policy.title}
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/65">{policy.subtitle}</p>
        </div>
      </section>

      <section className="section-mesh py-14 md:py-20">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="glass-card rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="space-y-10">
              {policy.intro && (
                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-600">
                  {policy.intro.map((block, index) => <PolicyBlockContent key={index} block={block} />)}
                </div>
              )}
              {policy.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="font-display text-xl sm:text-2xl font-bold leading-snug text-navy">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-gray-600">
                    {section.blocks.map((block, index) => <PolicyBlockContent key={index} block={block} />)}
                  </div>
                </section>
              ))}

              {policy.contactIntro && policy.contactDetails && (
                <section aria-labelledby="contact-and-grievance-details" className="pt-2">
                  <h2 id="contact-and-grievance-details" className="font-display text-xl sm:text-2xl font-bold text-navy">
                    Contact and Grievance Details
                  </h2>
                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-gray-600">{policy.contactIntro}</p>
                  <div className="mt-5"><PolicyDetails details={policy.contactDetails} /></div>
                </section>
              )}
            </div>
          </article>
        </div>
      </section>
    </>
  )
}
