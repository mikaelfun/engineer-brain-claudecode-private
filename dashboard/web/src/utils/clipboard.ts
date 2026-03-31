import { marked } from 'marked'

// Configure marked for synchronous operation
marked.use({ async: false })

/**
 * Extract email body from draft markdown (strip metadata header and footer).
 * Draft format:
 *   # Email Draft — {type}
 *   **To:** ...
 *   **Subject:** ...
 *   ---
 *   {body}
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

  if (separators.length >= 2) {
    // Body is between first and second ---
    return lines.slice(separators[0] + 1, separators[1]).join('\n').trim()
  } else if (separators.length === 1) {
    // Only one separator — body is everything after it
    return lines.slice(separators[0] + 1).join('\n').trim()
  }

  // No separator found, use full content
  return markdown
}

/**
 * Convert markdown to Outlook-compatible HTML.
 * Uses inline styles for maximum email client compatibility.
 */
function markdownToEmailHtml(markdown: string): string {
  const body = extractEmailBody(markdown)
  const rawHtml = marked.parse(body) as string

  // Wrap in email-safe container with inline styles
  return `<div style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">${rawHtml}</div>`
}

/**
 * Copy markdown content as rich HTML to clipboard.
 * Outlook and other email clients will paste with formatting preserved.
 * Falls back to plain text if clipboard API is not available.
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
      // Last resort fallback
      const textarea = document.createElement('textarea')
      textarea.value = plainText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  }
}
