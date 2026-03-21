/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Legacy semantic colors (keep for backward compatibility)
        primary: 'var(--accent-blue)',
        danger: 'var(--accent-red)',
        warning: 'var(--accent-amber)',
        success: 'var(--accent-green)',
        // Design system CSS variable colors
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        inset: 'var(--bg-inset)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        inverse: 'var(--text-inverse)',
      },
      backgroundColor: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        hover: 'var(--bg-hover)',
        active: 'var(--bg-active)',
        inset: 'var(--bg-inset)',
      },
      borderColor: {
        subtle: 'var(--border-subtle)',
        default: 'var(--border-default)',
        strong: 'var(--border-strong)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [typography],
}
