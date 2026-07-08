interface PocBoxLabelProps {
  /** Short category, e.g. "CMS property" */
  category: string
  /** Field or source name, e.g. "Title" */
  name: string
}

/** Subtle section label using Optimizely brand colours */
export default function PocBoxLabel({ category, name }: PocBoxLabelProps) {
  return (
    <p className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-optimizely-muted">
      <span className="rounded-full bg-optimizely-sage px-2.5 py-0.5">{category}</span>
      <span className="text-optimizely-forest/70">·</span>
      <span className="normal-case tracking-normal text-optimizely-forest">{name}</span>
    </p>
  )
}
