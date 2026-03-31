/**
 * SettingsPage — 用户配置页
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Settings, Save, FolderOpen, CheckCircle2, Clock, AlertCircle, Loader2, Users } from 'lucide-react'
import { Card, CardHeader } from '../components/common/Card'
import { apiGet, apiPut, apiPost } from '../api/client'

interface PathValidation {
  valid: boolean
  error?: string
  resolvedPath?: string
  caseCount?: number
  hasActiveDir?: boolean
}

export default function SettingsPage() {
  const [casesRoot, setCasesRoot] = useState('')
  const [teamsSearchCacheHours, setTeamsSearchCacheHours] = useState(4)
  const [podAlias, setPodAlias] = useState('mcpodvm@microsoft.com')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Path validation state
  const [pathValidation, setPathValidation] = useState<PathValidation | null>(null)
  const [validating, setValidating] = useState(false)
  const validateTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const config = await apiGet<Record<string, any>>('/settings')
      setCasesRoot(config.casesRoot || '')
      setTeamsSearchCacheHours(config.teamsSearchCacheHours ?? 4)
      setPodAlias(config.podAlias || 'mcpodvm@microsoft.com')
      // Validate the initial path
      if (config.casesRoot) {
        validatePath(config.casesRoot)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const validatePath = useCallback(async (path: string) => {
    if (!path.trim()) {
      setPathValidation(null)
      return
    }
    setValidating(true)
    try {
      const result = await apiPost<PathValidation>('/settings/validate-path', { path })
      setPathValidation(result)
    } catch {
      setPathValidation({ valid: false, error: 'Failed to validate path' })
    } finally {
      setValidating(false)
    }
  }, [])

  const handleCasesRootChange = (value: string) => {
    setCasesRoot(value)
    // Debounce path validation (500ms)
    if (validateTimer.current) clearTimeout(validateTimer.current)
    validateTimer.current = setTimeout(() => validatePath(value), 500)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      await apiPut('/settings', { casesRoot, teamsSearchCacheHours, podAlias })
      setSaved(true)
      // Re-validate after save to refresh resolved path
      validatePath(casesRoot)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span style={{ color: 'var(--text-tertiary)' }}>Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Settings className="w-6 h-6" /> Settings
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Configure your Engineer Brain workspace
        </p>
      </div>

      {/* Cases Root Path */}
      <Card>
        <CardHeader
          title="Case Data Root"
          icon={<FolderOpen className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />}
        />
        <p className="text-sm mb-3" style={{ color: 'var(--text-tertiary)' }}>
          The root directory where case data is stored. Active cases are expected at{' '}
          <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'var(--bg-hover)' }}>{'${casesRoot}/active/{case-id}/'}</code>
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={casesRoot}
            onChange={(e) => handleCasesRootChange(e.target.value)}
            placeholder="C:\\path\\to\\cases"
            className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 font-mono"
            style={{
              borderColor: pathValidation
                ? pathValidation.valid
                  ? 'var(--accent-green)'
                  : 'var(--accent-red)'
                : 'var(--border-default)',
              background: pathValidation
                ? pathValidation.valid
                  ? 'var(--accent-green-dim)'
                  : 'var(--accent-red-dim)'
                : undefined,
            }}
          />
          {validating && (
            <div className="flex items-center px-2">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-tertiary)' }} />
            </div>
          )}
        </div>

        {/* Path Validation Feedback */}
        {pathValidation && !validating && (
          <div
            className="mt-2 p-2.5 rounded-lg text-sm border"
            style={{
              background: pathValidation.valid ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
              borderColor: pathValidation.valid ? 'var(--accent-green)' : 'var(--accent-red)',
            }}
          >
            {pathValidation.valid ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5" style={{ color: 'var(--accent-green)' }}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Path is valid</span>
                </div>
                {pathValidation.resolvedPath && (
                  <p className="text-xs ml-5.5 font-mono" style={{ color: 'var(--accent-green)' }}>
                    {pathValidation.resolvedPath}
                  </p>
                )}
                <div className="flex items-center gap-3 ml-5.5 text-xs mt-1" style={{ color: 'var(--accent-green)' }}>
                  {pathValidation.hasActiveDir ? (
                    <>
                      <span className="flex items-center gap-1">
                        <FolderOpen className="w-3 h-3" />
                        <code>active/</code> directory found
                      </span>
                      <span className="font-semibold">
                        {pathValidation.caseCount} {pathValidation.caseCount === 1 ? 'case' : 'cases'}
                      </span>
                    </>
                  ) : (
                    <span className="flex items-center gap-1" style={{ color: 'var(--accent-amber)' }}>
                      <AlertCircle className="w-3 h-3" />
                      No <code>active/</code> subdirectory found
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5" style={{ color: 'var(--accent-red)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{pathValidation.error}</span>
                {pathValidation.resolvedPath && (
                  <span className="text-xs font-mono ml-1" style={{ color: 'var(--accent-red)' }}>({pathValidation.resolvedPath})</span>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Teams Search Cache Window */}
      <Card>
        <CardHeader
          title="Teams Search Cache Window"
          icon={<Clock className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />}
        />
        <p className="text-sm mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Skip Teams search if last search was within this many hours. Set to 0 to always search.
        </p>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={0}
            max={72}
            value={teamsSearchCacheHours}
            onChange={(e) => setTeamsSearchCacheHours(Number(e.target.value))}
            className="w-24 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 font-mono"
            style={{ borderColor: 'var(--border-default)' }}
          />
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>hours</span>
        </div>
      </Card>

      {/* POD Alias (CC Finder) */}
      <Card>
        <CardHeader
          title="POD Alias"
          icon={<Users className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />}
        />
        <p className="text-sm mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Email alias used to replace <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'var(--bg-hover)' }}>{'<Replace with POD alias>'}</code> in RDSE customer CC lists.
        </p>
        <input
          type="text"
          value={podAlias}
          onChange={(e) => setPodAlias(e.target.value)}
          placeholder="mcpodvm@microsoft.com"
          className="w-full max-w-md px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 font-mono"
          style={{ borderColor: 'var(--border-default)' }}
        />
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            background: saving ? 'var(--bg-active)' : 'var(--accent-blue)',
            color: saving ? 'var(--text-tertiary)' : 'var(--text-inverse)',
          }}
        >
          {saving ? (
            <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'transparent', borderTopColor: 'var(--text-inverse)' }} />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Settings
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--accent-green)' }}>
            <CheckCircle2 className="w-4 h-4" /> Saved
          </span>
        )}
        {saveError && (
          <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--accent-red)' }}>
            <AlertCircle className="w-4 h-4" /> {saveError}
          </span>
        )}
      </div>

      {/* Info */}
      <Card style={{ background: 'var(--accent-blue-dim)', borderColor: 'var(--accent-blue)' }}>
        <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--accent-blue)' }}>About Configuration</h4>
        <ul className="text-xs space-y-1" style={{ color: 'var(--accent-blue)' }}>
          <li>• Settings are stored in <code className="px-1 rounded" style={{ background: 'var(--accent-blue-dim)' }}>config.json</code> at the project root</li>
          <li>• Changes take effect immediately for new operations</li>
          <li>• Running sessions are not affected by settings changes</li>
          <li>• The casesRoot path is used by all subagents to locate case data</li>
        </ul>
      </Card>
    </div>
  )
}
