import { marked } from 'marked'

// Configure marked for synchronous operation
marked.use({ async: false })

/**
 * Strip YAML frontmatter from markdown content.
 * Frontmatter is delimited by --- on the first line and a closing ---.
 * Returns the content after the closing --- with leading blank lines trimmed.
 */
function stripFrontmatter(markdown: string): string {
  const lines = markdown.split('\n')
  // YAML frontmatter must start with --- on the very first line
  if (lines[0]?.trim() !== '---') return markdown

  // Find closing ---
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      // Return everything after the closing ---
      return lines.slice(i + 1).join('\n').replace(/^\n+/, '')
    }
  }
  // No closing --- found, return as-is
  return markdown
}

/**
 * Extract email body from draft markdown.
 * Strips: YAML frontmatter, legacy metadata header, signature block, footer.
 *
 * Supported draft formats:
 *
 *   Format A (YAML frontmatter — current):
 *     ---
 *     type: closure
 *     case: 2603300010000578
 *     to: user@example.com
 *     subject: "Re: ..."
 *     ---
 *     Hi xxx,
 *     {body}
 *     Best Regards,
 *     Kun Fang
 *
 *   Format B (legacy header — older drafts):
 *     # Email Draft — {type}
 *     **To:** ...
 *     **Subject:** ...
 *     ---
 *     Hi xxx,
 *     {body}
 *     Best Regards,
 *     Kun Fang
 *     ---
 *     _Generated at ..._
 */
function extractEmailBody(markdown: string): string {
  // Step 1: strip YAML frontmatter if present
  let content = stripFrontmatter(markdown)

  const lines = content.split('\n')

  // Step 2: find remaining --- separators (for legacy format or footer)
  const separators: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      separators.push(i)
    }
  }

  let bodyStart = 0
  let bodyEnd = lines.length

  if (separators.length >= 2) {
    // Legacy format: header --- body --- footer
    bodyStart = separators[0] + 1
    bodyEnd = separators[separators.length - 1]
  } else if (separators.length === 1) {
    // Single separator: either header end or footer start
    // If separator is near the top (within first 10 lines), it's a header end
    if (separators[0] < 10) {
      bodyStart = separators[0] + 1
    } else {
      bodyEnd = separators[0]
    }
  }
  // No separators: entire content is body (frontmatter already stripped)

  // Step 3: extract body lines
  const bodyLines = lines.slice(bodyStart, bodyEnd)

  // Step 4: find signature start — "Best Regards" or similar patterns
  let sigStart = bodyLines.length
  for (let i = 0; i < bodyLines.length; i++) {
    const line = bodyLines[i].trim().toLowerCase()
    if (
      line.startsWith('best regards') ||
      line.startsWith('best regard,') ||
      line.startsWith('此致') ||
      line.startsWith('regards,') ||
      line.startsWith('thanks,') ||
      line.startsWith('thank you,')
    ) {
      sigStart = i
      break
    }
  }

  return bodyLines.slice(0, sigStart).join('\n').trim()
}

/**
 * Convert markdown to Outlook-compatible HTML.
 * Uses inline styles for maximum email client compatibility.
 */
function markdownToEmailHtml(markdown: string): string {
  const body = extractEmailBody(markdown)
  const rawHtml = marked.parse(body) as string

  return `<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">${rawHtml}</div>`
}

/**
 * Copy markdown content as rich HTML to clipboard.
 * Strips metadata header, signature block, and footer.
 * Outlook will paste with formatting preserved (bold, lists, links).
 */
export async function copyAsRichText(markdown: string): Promise<void> {
  const html = markdownToEmailHtml(markdown)
  const plainText = extractEmailBody(markdown)

  try {
    const htmlBlob = new Blob([html], { type: 'text/html' })
    const textBlob = new Blob([plainText], { type: 'text/plain' })

    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      })
    ])
  } catch {
    // Fallback: copy plain text
    try {
      await navigator.clipboard.writeText(plainText)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = plainText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  }
}
