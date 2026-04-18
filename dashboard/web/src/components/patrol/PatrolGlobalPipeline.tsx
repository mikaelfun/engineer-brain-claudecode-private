/**
 * PatrolGlobalPipeline — 5 horizontal nodes: Discover → Filter → Warmup → Process → Aggregate
 *
 * Maps patrol phase to node statuses with color-coded circles and connecting lines.
 */
import { usePatrolStore, type PatrolPhase } from '../../stores/patrolStore'
import { Card } from '../common/Card'

type NodeStatus = 'pending' | 'active' | 'completed'

interface PipelineNode {
  label: string
  phase: PatrolPhase
  status: NodeStatus
}

const PHASE_ORDER: PatrolPhase[] = ['discovering', 'filtering', 'warming-up', 'processing', 'aggregating']

const NODE_LABELS: Record<string, string> = {
  discovering: 'Discover',
  filtering: 'Filter',
  'warming-up': 'Warmup',
  processing: 'Process',
  aggregating: 'Aggregate',
}

function deriveNodes(phase: PatrolPhase): PipelineNode[] {
  const currentIdx = PHASE_ORDER.indexOf(phase)

  return PHASE_ORDER.map((p, idx) => {
    let status: NodeStatus = 'pending'

    if (phase === 'completed') {
      status = 'completed'
    } else if (phase === 'failed') {
      // Everything up to current is completed, current is completed (failed after)
      status = idx <= currentIdx ? 'completed' : 'pending'
    } else if (currentIdx >= 0) {
      if (idx < currentIdx) status = 'completed'
      else if (idx === currentIdx) status = 'active'
      else status = 'pending'
    }

    return { label: NODE_LABELS[p], phase: p, status }
  })
}

const statusColors: Record<NodeStatus, string> = {
  completed: 'var(--accent-green)',
  active: 'var(--accent-blue)',
  pending: 'var(--text-tertiary)',
}

export default function PatrolGlobalPipeline() {
  const phase = usePatrolStore(s => s.phase)

  // Don't render when idle
  if (phase === 'idle') return null

  const nodes = deriveNodes(phase)

  return (
    <Card padding="sm">
      <div className="flex items-center justify-center gap-0 py-3 px-4 overflow-x-auto">
        {nodes.map((node, idx) => (
          <div key={node.phase} className="flex items-center">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
              {/* Circle */}
              <div
                className="relative flex items-center justify-center"
                style={{ width: 32, height: 32 }}
              >
                <div
                  className="rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    width: node.status === 'active' ? 28 : 24,
                    height: node.status === 'active' ? 28 : 24,
                    background: node.status === 'pending' ? 'transparent' : statusColors[node.status],
                    border: `2px solid ${statusColors[node.status]}`,
                  }}
                >
                  {node.status === 'completed' && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="var(--text-inverse)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {node.status === 'active' && (
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background: 'var(--text-inverse)',
                        animation: 'patrol-pulse 2s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
                {/* Pulse ring for active node */}
                {node.status === 'active' && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: `2px solid ${statusColors.active}`,
                      animation: 'patrol-ring 2s ease-out infinite',
                      opacity: 0,
                    }}
                  />
                )}
              </div>
              {/* Label */}
              <span
                className="text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{
                  color: node.status === 'pending' ? 'var(--text-tertiary)' : statusColors[node.status],
                }}
              >
                {node.label}
              </span>
            </div>

            {/* Connecting line */}
            {idx < nodes.length - 1 && (
              <div
                className="flex-shrink-0 transition-all duration-300"
                style={{
                  width: 40,
                  height: 2,
                  background: nodes[idx + 1].status !== 'pending'
                    ? 'var(--accent-green)'
                    : node.status === 'active'
                      ? `linear-gradient(to right, ${statusColors.active}, var(--text-tertiary))`
                      : 'var(--border-subtle)',
                  marginBottom: 20, // align with circles, not labels
                  borderRadius: 1,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes patrol-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }
        @keyframes patrol-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </Card>
  )
}
