/**
 * SettingsPage — 用户配置页
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Settings, Save, FolderOpen, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react'
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
      await apiPut('/settings', { casesRoot, teamsSearchCacheHours })
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
        <span className="text-gray-400">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6" /> Settings
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure your Engineer Brain workspace
        </p>
      </div>

      {/* Cases Root Path */}
      <Card>
        <CardHeader
          title="Case Data Root"
          icon={<FolderOpen className="w-4 h-4 text-blue-500" />}
        />
        <p className="text-sm text-gray-500 mb-3">
          The root directory where case data is stored. Active cases are expected at{' '}
          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'${casesRoot}/active/{case-id}/'}</code>
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={casesRoot}
            onChange={(e) => handleCasesRootChange(e.target.value)}
            placeholder="C:\\path\\to\\cases"
            className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono ${
              pathValidation
                ? pathValidation.valid
                  ? 'border-green-300 bg-green-50/30'
                  : 'border-red-300 bg-red-50/30'
                : 'border-gray-200'
            }`}
          />
          {validating && (
            <div className="flex items-center px-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {/* Path Validation Feedback */}
        {pathValidation && !validating && (
          <div className={`mt-2 p-2.5 rounded-lg text-sm ${
            pathValidation.valid
              ? 'bg-green-50 border border-green-100'
              : 'bg-red-50 border border-red-100'
          }`}>
            {pathValidation.valid ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-green-700">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Path is valid</span>
                </div>
                {pathValidation.resolvedPath && (
                  <p className="text-xs text-green-600 ml-5.5 font-mono">
                    {pathValidation.resolvedPath}
                  </p>
                )}
                <div className="flex items-center gap-3 ml-5.5 text-xs text-green-600 mt-1">
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
                    <span className="text-yellow-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      No <code>active/</code> subdirectory found
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{pathValidation.error}</span>
                {pathValidation.resolvedPath && (
                  <span className="text-xs text-red-500 font-mono ml-1">({pathValidation.resolvedPath})</span>
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
          icon={<Clock className="w-4 h-4 text-blue-500" />}
        />
        <p className="text-sm text-gray-500 mb-3">
          Skip Teams search if last search was within this many hours. Set to 0 to always search.
        </p>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={0}
            max={72}
            value={teamsSearchCacheHours}
            onChange={(e) => setTeamsSearchCacheHours(Number(e.target.value))}
            className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
          />
          <span className="text-sm text-gray-500">hours</span>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:bg-gray-300 transition-colors"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Settings
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" /> Saved
          </span>
        )}
        {saveError && (
          <span className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" /> {saveError}
          </span>
        )}
      </div>

      {/* Info */}
      <Card className="bg-blue-50/50 border-blue-100">
        <h4 className="font-medium text-blue-800 text-sm mb-2">About Configuration</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Settings are stored in <code className="bg-blue-100 px-1 rounded">config.json</code> at the project root</li>
          <li>• Changes take effect immediately for new operations</li>
          <li>• Running sessions are not affected by settings changes</li>
          <li>• The casesRoot path is used by all subagents to locate case data</li>
        </ul>
      </Card>
    </div>
  )
}
