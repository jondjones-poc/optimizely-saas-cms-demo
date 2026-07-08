interface HeadingProps {
  Heading?: string
  HeadingSize?: 'h1' | 'h2' | 'h3'
  Alignment?: 'left' | 'center' | 'right' | 'middle'
}

/** POC Heading block — displays the Heading field from CMS */
export default function Heading({
  Heading: text,
  HeadingSize = 'h2',
  Alignment = 'left',
}: HeadingProps) {
  if (!text) return null

  const Tag = HeadingSize === 'h1' ? 'h1' : HeadingSize === 'h3' ? 'h3' : 'h2'
  const alignmentClass =
    Alignment === 'right'
      ? 'text-right'
      : Alignment === 'center' || Alignment === 'middle'
        ? 'text-center'
        : 'text-left'

  const sizeClass =
    HeadingSize === 'h1'
      ? 'text-4xl'
      : HeadingSize === 'h3'
        ? 'text-xl'
        : 'text-2xl'

  return <Tag className={`font-bold text-gray-900 ${sizeClass} ${alignmentClass}`}>{text}</Tag>
}
