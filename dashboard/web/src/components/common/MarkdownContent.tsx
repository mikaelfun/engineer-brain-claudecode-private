/**
 * MarkdownContent — 美化的 Markdown 渲染组件 (design system v2)
 * 使用 react-markdown + remark-gfm + @tailwindcss/typography
 * 支持自定义表格、代码块、引用块样式，CSS 变量驱动主题化
 */
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownContentProps {
  children: string
  className?: string
}

/** Custom component overrides for ReactMarkdown */
const markdownComponents = {
  // Table: full-width with border-collapse
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-4">
      <table
        className="min-w-full border-collapse text-sm"
        style={{ border: '1px solid var(--border-default)' }}
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead style={{ background: 'var(--bg-inset)' }} {...props}>{children}</thead>
  ),
  th: ({ children, ...props }: any) => (
    <th
      className="px-3 py-2 text-left font-semibold text-[11px] uppercase"
      style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', letterSpacing: '0.25px' }}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td
      className="px-3 py-2"
      style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
      {...props}
    >
      {children}
    </td>
  ),
  tr: ({ children, ...props }: any) => (
    <tr className="transition-colors" {...props}>
      {children}
    </tr>
  ),

  // Blockquote: styled left border + background
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="px-4 py-2 my-4 italic rounded-r-lg"
      style={{
        borderLeft: '4px solid var(--accent-blue)',
        background: 'var(--accent-blue-dim)',
        color: 'var(--text-secondary)',
      }}
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Inline code: subtle background
  code: ({ children, className, ...props }: any) => {
    // If it's a code block (inside <pre>), use different styling
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return (
        <code className={`${className || ''} text-sm`} {...props}>
          {children}
        </code>
      )
    }
    // Inline code
    return (
      <code
        className="px-1.5 py-0.5 rounded text-sm font-mono"
        style={{
          background: 'var(--bg-inset)',
          color: 'var(--accent-red)',
          border: '1px solid var(--border-subtle)',
        }}
        {...props}
      >
        {children}
      </code>
    )
  },

  // Pre (code block): dark background
  pre: ({ children, ...props }: any) => (
    <pre
      className="px-4 py-3 rounded-lg overflow-x-auto my-4 text-sm leading-relaxed"
      style={{
        background: 'var(--bg-inset)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-subtle)',
      }}
      {...props}
    >
      {children}
    </pre>
  ),

  // Headings: clear hierarchy
  h1: ({ children, ...props }: any) => (
    <h1
      className="text-xl font-bold mt-6 mb-3 pb-2"
      style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2
      className="text-lg font-bold mt-5 mb-2 pb-1.5"
      style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-base font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }} {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 className="text-sm font-semibold mt-3 mb-1.5" style={{ color: 'var(--text-secondary)' }} {...props}>
      {children}
    </h4>
  ),

  // Lists: proper spacing
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-outside pl-5 my-2 space-y-1" style={{ color: 'var(--text-primary)' }} {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-outside pl-5 my-2 space-y-1" style={{ color: 'var(--text-primary)' }} {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="leading-relaxed" style={{ color: 'var(--text-primary)' }} {...props}>
      {children}
    </li>
  ),

  // Paragraphs
  p: ({ children, ...props }: any) => (
    <p className="my-2 leading-relaxed" style={{ color: 'var(--text-primary)', overflowWrap: 'anywhere' }} {...props}>
      {children}
    </p>
  ),

  // Links
  a: ({ children, href, ...props }: any) => (
    <a
      href={href}
      className="underline transition-colors"
      style={{ color: 'var(--accent-blue)' }}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),

  // Horizontal rule
  hr: (props: any) => (
    <hr className="my-4" style={{ borderColor: 'var(--border-subtle)' }} {...props} />
  ),

  // Strong/bold
  strong: ({ children, ...props }: any) => (
    <strong className="font-semibold" style={{ color: 'var(--text-primary)' }} {...props}>{children}</strong>
  ),
}

export default function MarkdownContent({ children, className = '' }: MarkdownContentProps) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
