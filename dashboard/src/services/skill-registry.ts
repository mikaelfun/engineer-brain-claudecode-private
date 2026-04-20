import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, basename } from 'path'
import matter from 'gray-matter'

export interface SkillMeta {
  name: string
  displayName: string
  description: string
  category: 'inline' | 'agent' | 'orchestrator' | 'casework-sub-skill'
  stability: 'stable' | 'beta' | 'dev'
  requiredInput?: string
  mcpServers?: string[]
  estimatedDuration?: string
  version?: string
  promptTemplate?: string
  steps?: string[]
  webUiAlias?: string
  /** Relative path from skills root to skill directory (e.g., 'casework/assess') */
  skillDir?: string
}

const REQUIRED_FIELDS: (keyof SkillMeta)[] = ['name', 'displayName', 'description', 'category', 'stability']
const VALID_CATEGORIES = ['inline', 'agent', 'orchestrator', 'casework-sub-skill'] as const
const VALID_STABILITIES = ['stable', 'beta', 'dev'] as const

class SkillRegistryService {
  private registry = new Map<string, SkillMeta>()
  private aliasMap = new Map<string, string>()
  private skillsDir: string

  constructor(projectRoot: string) {
    this.skillsDir = join(projectRoot, '.claude', 'skills')
  }

  initialize(): void {
    if (!existsSync(this.skillsDir)) {
      console.warn(`[skill-registry] Skills directory not found: ${this.skillsDir}`)
      return
    }

    const dirs = readdirSync(this.skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)

    for (const dir of dirs) {
      this.loadSkill(dir)
    }

    console.log(`[skill-registry] Loaded ${this.registry.size} skills (${[...this.registry.values()].filter(s => s.stability !== 'dev').length} WebUI-visible)`)
  }

  loadSkill(dirName: string): void {
    const skillPath = join(this.skillsDir, dirName, 'SKILL.md')
    if (!existsSync(skillPath)) return

    try {
      const content = readFileSync(skillPath, 'utf-8')
      const { data } = matter(content)

      if (!data || Object.keys(data).length === 0) {
        console.warn(`[skill-registry] No frontmatter in ${skillPath}, skipping`)
        return
      }

      const missing = REQUIRED_FIELDS.filter(f => !data[f])
      if (missing.length > 0) {
        console.warn(`[skill-registry] ${dirName}: missing required fields: ${missing.join(', ')}, skipping`)
        return
      }

      if (!VALID_CATEGORIES.includes(data.category)) {
        console.warn(`[skill-registry] ${dirName}: invalid category "${data.category}", skipping`)
        return
      }
      if (!VALID_STABILITIES.includes(data.stability)) {
        console.warn(`[skill-registry] ${dirName}: invalid stability "${data.stability}", skipping`)
        return
      }

      const meta: SkillMeta = {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        category: data.category,
        stability: data.stability,
        requiredInput: data.requiredInput,
        mcpServers: data.mcpServers,
        estimatedDuration: data.estimatedDuration,
        version: data.version,
        promptTemplate: data.promptTemplate,
        steps: data.steps,
        webUiAlias: data.webUiAlias,
        skillDir: dirName,
      }

      this.registry.set(meta.name, meta)

      if (meta.webUiAlias) {
        this.aliasMap.set(meta.webUiAlias, meta.name)
      }

      // For orchestrator skills, also load sub-skills from subdirectories
      if (meta.category === 'orchestrator') {
        this.loadSubSkills(dirName)
      }
    } catch (err) {
      console.error(`[skill-registry] Error loading ${skillPath}:`, err)
    }
  }

  /**
   * Load sub-skills from subdirectories of an orchestrator skill.
   * Each sub-skill gets a webUiAlias derived from its name (e.g., 'casework:assess' → 'assess').
   */
  private loadSubSkills(parentDir: string): void {
    const parentPath = join(this.skillsDir, parentDir)
    let subDirs: string[]
    try {
      subDirs = readdirSync(parentPath, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
    } catch {
      return
    }

    for (const subDir of subDirs) {
      // Skip non-skill directories (scripts, etc.)
      const skillPath = join(parentPath, subDir, 'SKILL.md')
      if (!existsSync(skillPath)) continue

      try {
        const content = readFileSync(skillPath, 'utf-8')
        const { data } = matter(content)
        if (!data || !data.name) continue

        // Sub-skills may have non-standard categories — accept them
        const meta: SkillMeta = {
          name: data.name,
          displayName: data.displayName || subDir,
          description: data.description || '',
          category: data.category || 'casework-sub-skill',
          stability: data.stability || 'beta',
          requiredInput: data.requiredInput,
          mcpServers: data.mcpServers,
          estimatedDuration: data.estimatedDuration,
          version: data.version,
          promptTemplate: data.promptTemplate,
          steps: data.steps,
          webUiAlias: data.webUiAlias,
          skillDir: `${parentDir}/${subDir}`,
        }

        // Auto-derive webUiAlias from name: "casework:assess" → "assess"
        if (!meta.webUiAlias && meta.name.includes(':')) {
          meta.webUiAlias = meta.name.split(':').pop()!
        }

        this.registry.set(meta.name, meta)
        if (meta.webUiAlias) {
          this.aliasMap.set(meta.webUiAlias, meta.name)
        }
      } catch (err) {
        console.error(`[skill-registry] Error loading sub-skill ${parentDir}/${subDir}:`, err)
      }
    }
  }

  getSkill(nameOrAlias: string): SkillMeta | undefined {
    return this.registry.get(nameOrAlias) ?? this.registry.get(this.aliasMap.get(nameOrAlias) ?? '')
  }

  listSkills(options?: { includeDev?: boolean }): SkillMeta[] {
    const all = [...this.registry.values()]
    if (options?.includeDev) return all
    return all.filter(s => s.stability !== 'dev')
  }

  getPrompt(nameOrAlias: string, params: Record<string, string>): string | null {
    const skill = this.getSkill(nameOrAlias)
    if (!skill?.promptTemplate) return null

    let prompt = skill.promptTemplate
    for (const [key, value] of Object.entries(params)) {
      prompt = prompt.replaceAll(`{${key}}`, value)
    }
    return prompt.trim()
  }

  reloadSkill(changedPath: string): void {
    const normalized = changedPath.replace(/\\/g, '/')
    const match = normalized.match(/\.claude\/skills\/([^/]+)\/SKILL\.md/)
    if (!match) return

    const dirName = match[1]
    const oldSkill = this.registry.get(dirName)
    this.registry.delete(dirName)

    if (oldSkill?.webUiAlias) {
      this.aliasMap.delete(oldSkill.webUiAlias)
    }

    this.loadSkill(dirName)
    console.log(`[skill-registry] Reloaded skill: ${dirName}`)
  }

  getOrchestratorSteps(orchestratorName: string): SkillMeta[] {
    const orchestrator = this.getSkill(orchestratorName)
    if (!orchestrator?.steps) return []

    return orchestrator.steps
      .map(stepName => this.getSkill(stepName))
      .filter((s): s is SkillMeta => s !== undefined)
  }
}

let _instance: SkillRegistryService | null = null

export function initSkillRegistry(projectRoot: string): SkillRegistryService {
  _instance = new SkillRegistryService(projectRoot)
  _instance.initialize()
  return _instance
}

export function getSkillRegistry(): SkillRegistryService {
  if (!_instance) throw new Error('SkillRegistryService not initialized. Call initSkillRegistry() first.')
  return _instance
}
