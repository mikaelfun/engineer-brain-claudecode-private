/**
 * SettingsPage — 用户配置页
 */
import { useState, useEffect } from 'react'
import { Settings, Save, FolderOpen, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader } from '../components/common/Card'
import { apiGet, apiPut } from '../api/client'

export default function SettingsPage() {
  const [casesRoot, setCasesRoot] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const config = await apiGet<Record<string, any>>('/settings')
      setCasesRoot(config.casesRoot || '')
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await apiPut('/settings', { casesRoot })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert('Failed to save settings')
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
            onChange={(e) => setCasesRoot(e.target.value)}
            placeholder="C:\\path\\to\\cases"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
          />
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
