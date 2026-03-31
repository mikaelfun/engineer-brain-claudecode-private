import { marked } from 'marked'

// Configure marked for synchronous operation
marked.use({ async: false })

/**
 * Extract email body from draft markdown.
 * Strips: metadata header (before first ---), signature (from Best Regards), footer (after last ---)
 *
 * Draft format:
 *   # Email Draft — {type}
 *   **To:** ...
 *   **Subject:** ...
 *   ---
 *   Hi xxx,
 *   {body}
 *   Best Regards,
 *   Kun Fang
 *   ...
 *   ---
 *   _Generated at ..._
 */
function extractEmailBody(markdown: string): string {
  const lines = markdown.split('\n')

  // Find --- separators
  const separators: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      separators.push(i)
    }
  }

  let bodyStart = 0
  let bodyEnd = lines.length

  if (separators.length >= 2) {
    bodyStart = separators[0] + 1
    bodyEnd = separators[separators.length - 1]
  } else if (separators.length === 1) {
    bodyStart = separators[0] + 1
  }

  // Extract body lines
  const bodyLines = lines.slice(bodyStart, bodyEnd)

  // Find signature start — "Best Regards" or similar patterns
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
