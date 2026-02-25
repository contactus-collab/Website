/**
 * Renders text with embedded URLs as clickable links (opens in new tab).
 * Safe: only wraps URLs, no raw HTML from content.
 */
const URL_SPLIT_REGEX = /(https?:\/\/[^\s<>]+)/gi
const IS_URL_REGEX = /^https?:\/\//

export default function TextWithLinks({ text, className }: { text: string; className?: string }) {
  if (!text || !text.trim()) return null
  const parts = text.split(URL_SPLIT_REGEX)
  return (
    <span className={className}>
      {parts.map((part, i) =>
        IS_URL_REGEX.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0F006A] underline hover:opacity-80 break-all"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}
