import { marked } from 'marked'

/**
 * Extract email body from draft markdown (strip metadata header).
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

  // Find first --- separator (after metadata header)
  let bodyStart = -1
  let bodyEnd = lines.length

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (bodyStart === -1) {
        bodyStart = i + 1
      } else {
        // Second --- is the footer separator
        bodyEnd = i
      }
    }
  }

  if (bodyStart === -1) {
    // No separator found, use full content
    return markdown
  }

  return lines.slice(bodyStart, bodyEnd).join('\n').trim()
}

/**
 * Convert markdown to Outlook-compatible HTML.
 * Uses inline styles for maximum email client compatibility.
 */
function markdownToEmailHtml(markdown: string): string {
  const body = extractEmailBody(markdown)
  const rawHtml = marked.parse(body, { async: false }) as string

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
