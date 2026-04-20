/**
 * useDashboardKeys — Keyboard shortcuts for Dashboard page.
 *
 * Shortcuts (only when no input/textarea is focused):
 *   j     — move selection down in Actions list
 *   k     — move selection up in Actions list
 *   Enter — open selected case
 *   p     — scroll to pipeline section
 */
import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface UseDashboardKeysOptions {
  actionItems: Array<{ id: string; caseNumber?: string }>
  selectedIndex: number
  setSelectedIndex: (idx: number | ((prev: number) => number)) => void
  pipelineRef?: React.RefObject<HTMLDivElement | null>
}

export function useDashboardKeys({
  actionItems,
  selectedIndex,
  setSelectedIndex,
  pipelineRef,
}: UseDashboardKeysOptions) {
  const navigate = useNavigate()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      switch (e.key) {
        case 'j':
          e.preventDefault()
          setSelectedIndex((prev: number) =>
            Math.min(prev + 1, actionItems.length - 1),
          )
          break
        case 'k':
          e.preventDefault()
          setSelectedIndex((prev: number) => Math.max(prev - 1, 0))
          break
        case 'Enter': {
          const item = actionItems[selectedIndex]
          if (item?.caseNumber) {
            navigate(`/case/${item.caseNumber}`)
          }
          break
        }
        case 'p':
          e.preventDefault()
          pipelineRef?.current?.scrollIntoView({ behavior: 'smooth' })
          break
      }
    },
    [actionItems, selectedIndex, setSelectedIndex, navigate, pipelineRef],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
