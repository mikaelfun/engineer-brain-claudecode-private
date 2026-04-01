import { Hono } from 'hono'
import { getSkillRegistry } from '../services/skill-registry.js'

const skillRoutes = new Hono()

/**
 * GET / — List all registered skills (excludes dev by default).
 * Query: ?includeDev=true to include dev-stability skills.
 */
skillRoutes.get('/', (c) => {
  const includeDev = c.req.query('includeDev') === 'true'
  const skills = getSkillRegistry().listSkills({ includeDev })
  return c.json(skills.map(s => ({
    name: s.name,
    displayName: s.displayName,
    description: s.description,
    category: s.category,
    stability: s.stability,
    requiredInput: s.requiredInput,
    estimatedDuration: s.estimatedDuration,
    steps: s.steps,
    webUiAlias: s.webUiAlias,
  })))
})

/**
 * GET /:name — Get a single skill's details.
 */
skillRoutes.get('/:name', (c) => {
  const name = c.req.param('name')
  const skill = getSkillRegistry().getSkill(name)
  if (!skill) {
    return c.json({ error: `Skill "${name}" not found` }, 404)
  }
  return c.json({
    name: skill.name,
    displayName: skill.displayName,
    description: skill.description,
    category: skill.category,
    stability: skill.stability,
    requiredInput: skill.requiredInput,
    mcpServers: skill.mcpServers,
    estimatedDuration: skill.estimatedDuration,
    version: skill.version,
    steps: skill.steps,
    webUiAlias: skill.webUiAlias,
  })
})

export { skillRoutes }
