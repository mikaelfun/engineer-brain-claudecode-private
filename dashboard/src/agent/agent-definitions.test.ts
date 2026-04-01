/**
 * agent-definitions.test.ts — Unit tests for loadAgentDefinitions() (ISS-200)
 *
 * Tests: YAML frontmatter parsing, field mapping to AgentDefinition,
 *        error tolerance, caching behavior.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { loadAgentDefinitions, clearAgentDefinitionsCache } from './case-session-manager.js'

// Mock fs module
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  return {
    ...actual,
    existsSync: vi.fn(actual.existsSync),
    readFileSync: vi.fn(actual.readFileSync),
    readdirSync: vi.fn(actual.readdirSync),
    writeFileSync: actual.writeFileSync,
    mkdirSync: actual.mkdirSync,
    appendFileSync: actual.appendFileSync,
  }
})

const mockExistsSync = vi.mocked(existsSync)
const mockReadFileSync = vi.mocked(readFileSync)
const mockReaddirSync = vi.mocked(readdirSync)

// Sample agent .md content for testing
const TEAMS_SEARCH_MD = `---
name: teams-search
description: "Teams 消息搜索 + 落盘"
tools: Bash, Read, Write
model: sonnet
maxTurns: 20
mcpServers:
  - teams
---

# Teams Search Agent

搜索与 Case 相关的 Teams 消息，落盘到 \`{caseDir}/teams/\`。

## 执行步骤
1. Search Teams messages
2. Save results`

const ONENOTE_SEARCH_MD = `---
name: onenote-case-search
description: Search personal OneNote for case-specific notes
tools: Bash, Read, Write, Glob, Grep
model: sonnet
maxTurns: 15
---

# OneNote Case Search Agent

Search the engineer's personal OneNote notebook for notes.`

const TROUBLESHOOTER_MD = `---
name: troubleshooter
description: "技术排查 + 写分析报告"
tools: Bash, Read, Write, Glob, Grep, WebSearch
model: opus
mcpServers:
  - kusto
  - msft-learn
  - icm
  - local-rag
---

# Troubleshooter Agent

Perform technical investigation using Kusto diagnostics.`

const MALFORMED_MD = `This file has no frontmatter at all.
Just plain markdown content.`

const MISSING_NAME_MD = `---
description: "Missing name field"
tools: Bash
---

# No Name Agent`

describe('loadAgentDefinitions (ISS-200)', () => {
  beforeEach(() => {
    clearAgentDefinitionsCache()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Helper to setup mock filesystem
  function setupMockAgents(files: Record<string, string>) {
    // Allow real existsSync/readFileSync for non-agent paths (session store etc.)
    mockExistsSync.mockImplementation((p: any) => {
      const pathStr = String(p)
      if (pathStr.includes('.claude/agents') || pathStr.includes('.claude\\agents')) return true
      // Fall through to default — return false for unknown paths
      return false
    })
    mockReaddirSync.mockReturnValue(Object.keys(files) as any)
    mockReadFileSync.mockImplementation((p: any, _opts?: any) => {
      const pathStr = String(p)
      for (const [filename, content] of Object.entries(files)) {
        if (pathStr.endsWith(filename)) return content
      }
      // For session store and other files, return empty
      return '{}'
    })
  }

  // ====== Normal parsing ======

  describe('normal parsing', () => {
    it('parses a single agent with all fields', () => {
      setupMockAgents({ 'teams-search.md': TEAMS_SEARCH_MD })

      const agents = loadAgentDefinitions()

      expect(agents).toHaveProperty('teams-search')
      const def = agents['teams-search']
      expect(def.description).toBe('Teams 消息搜索 + 落盘')
      expect(def.tools).toEqual(['Bash', 'Read', 'Write'])
      expect(def.model).toBe('sonnet')
      expect(def.mcpServers).toEqual(['teams'])
      expect(def.prompt).toContain('# Teams Search Agent')
      expect(def.prompt).toContain('执行步骤')
    })

    it('parses multiple agents', () => {
      setupMockAgents({
        'teams-search.md': TEAMS_SEARCH_MD,
        'onenote-case-search.md': ONENOTE_SEARCH_MD,
        'troubleshooter.md': TROUBLESHOOTER_MD,
      })

      const agents = loadAgentDefinitions()

      expect(Object.keys(agents)).toHaveLength(3)
      expect(agents).toHaveProperty('teams-search')
      expect(agents).toHaveProperty('onenote-case-search')
      expect(agents).toHaveProperty('troubleshooter')
    })
  })

  // ====== Tools parsing ======

  describe('tools parsing', () => {
    it('splits comma-separated tools into array', () => {
      setupMockAgents({ 'teams-search.md': TEAMS_SEARCH_MD })

      const agents = loadAgentDefinitions()
      expect(agents['teams-search'].tools).toEqual(['Bash', 'Read', 'Write'])
    })

    it('handles tools with extra spaces', () => {
      setupMockAgents({
        'test.md': `---
name: test-agent
description: test
tools: Bash ,  Read ,Write, Glob
---

Body content.`
      })

      const agents = loadAgentDefinitions()
      expect(agents['test-agent'].tools).toEqual(['Bash', 'Read', 'Write', 'Glob'])
    })
  })

  // ====== mcpServers parsing ======

  describe('mcpServers parsing', () => {
    it('parses YAML list mcpServers', () => {
      setupMockAgents({ 'troubleshooter.md': TROUBLESHOOTER_MD })

      const agents = loadAgentDefinitions()
      expect(agents['troubleshooter'].mcpServers).toEqual(['kusto', 'msft-learn', 'icm', 'local-rag'])
    })

    it('omits mcpServers when not specified', () => {
      setupMockAgents({ 'onenote-case-search.md': ONENOTE_SEARCH_MD })

      const agents = loadAgentDefinitions()
      expect(agents['onenote-case-search'].mcpServers).toBeUndefined()
    })
  })

  // ====== Model field ======

  describe('model field', () => {
    it('passes model from frontmatter', () => {
      setupMockAgents({ 'troubleshooter.md': TROUBLESHOOTER_MD })

      const agents = loadAgentDefinitions()
      expect(agents['troubleshooter'].model).toBe('opus')
    })

    it('passes sonnet model', () => {
      setupMockAgents({ 'teams-search.md': TEAMS_SEARCH_MD })

      const agents = loadAgentDefinitions()
      expect(agents['teams-search'].model).toBe('sonnet')
    })
  })

  // ====== Prompt extraction ======

  describe('prompt extraction', () => {
    it('uses markdown body after frontmatter as prompt', () => {
      setupMockAgents({ 'onenote-case-search.md': ONENOTE_SEARCH_MD })

      const agents = loadAgentDefinitions()
      const prompt = agents['onenote-case-search'].prompt
      expect(prompt).toContain('# OneNote Case Search Agent')
      expect(prompt).toContain('Search the engineer\'s personal OneNote notebook')
      // Should NOT contain frontmatter
      expect(prompt).not.toContain('name:')
      expect(prompt).not.toContain('---')
    })
  })

  // ====== Error tolerance ======

  describe('error tolerance', () => {
    it('skips files without valid frontmatter', () => {
      setupMockAgents({
        'teams-search.md': TEAMS_SEARCH_MD,
        'malformed.md': MALFORMED_MD,
      })

      const agents = loadAgentDefinitions()
      expect(Object.keys(agents)).toHaveLength(1)
      expect(agents).toHaveProperty('teams-search')
      expect(agents).not.toHaveProperty('malformed')
    })

    it('skips files with missing name field', () => {
      setupMockAgents({
        'teams-search.md': TEAMS_SEARCH_MD,
        'no-name.md': MISSING_NAME_MD,
      })

      const agents = loadAgentDefinitions()
      expect(Object.keys(agents)).toHaveLength(1)
      expect(agents).toHaveProperty('teams-search')
    })

    it('returns empty record when agents directory does not exist', () => {
      mockExistsSync.mockReturnValue(false)

      const agents = loadAgentDefinitions()
      expect(agents).toEqual({})
    })
  })

  // ====== Caching ======

  describe('caching', () => {
    it('returns cached result on second call without re-reading files', () => {
      setupMockAgents({ 'teams-search.md': TEAMS_SEARCH_MD })

      const first = loadAgentDefinitions()
      expect(Object.keys(first)).toHaveLength(1)

      // Clear mocks and call again — should use cache
      vi.clearAllMocks()
      const second = loadAgentDefinitions()
      expect(second).toBe(first) // Same reference (cached)
      expect(mockReaddirSync).not.toHaveBeenCalled() // No file reads on second call
    })

    it('re-reads files after cache clear', () => {
      setupMockAgents({ 'teams-search.md': TEAMS_SEARCH_MD })
      loadAgentDefinitions()

      clearAgentDefinitionsCache()
      setupMockAgents({ 'troubleshooter.md': TROUBLESHOOTER_MD })

      const agents = loadAgentDefinitions()
      expect(agents).toHaveProperty('troubleshooter')
    })
  })

  // ====== Description quote stripping ======

  describe('description parsing', () => {
    it('strips surrounding quotes from description', () => {
      setupMockAgents({ 'teams-search.md': TEAMS_SEARCH_MD })

      const agents = loadAgentDefinitions()
      // "Teams 消息搜索 + 落盘" should have quotes stripped
      expect(agents['teams-search'].description).toBe('Teams 消息搜索 + 落盘')
      expect(agents['teams-search'].description).not.toContain('"')
    })

    it('handles unquoted description', () => {
      setupMockAgents({ 'onenote-case-search.md': ONENOTE_SEARCH_MD })

      const agents = loadAgentDefinitions()
      expect(agents['onenote-case-search'].description).toBe('Search personal OneNote for case-specific notes')
    })
  })
})
