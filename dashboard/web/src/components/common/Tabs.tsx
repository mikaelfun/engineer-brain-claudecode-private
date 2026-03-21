/**
 * Tabs — Tab 导航组件 (design system v2)
 */

interface Tab {
  id: string
  label: string
  icon?: string
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div
      className={`flex overflow-x-auto ${className}`}
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
            style={{
              borderBottomColor: isActive ? 'var(--accent-blue)' : 'transparent',
              color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                ;(e.currentTarget as HTMLElement).style.borderBottomColor = 'var(--border-default)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                ;(e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent'
              }
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className="ml-1 px-2 py-0.5 text-xs rounded-full"
                style={{
                  background: isActive ? 'var(--accent-blue-dim)' : 'var(--bg-inset)',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
