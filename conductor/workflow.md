# Workflow Preferences: EngineerBrain

## Development Approach
- **TDD:** Preferred for dashboard features when applicable
- **Commits:** Feature-based commits with clear descriptions
- **Language:** Code in English, comments/docs bilingual (EN/ZH)

## Code Conventions
- TypeScript strict mode
- Hono for backend routes
- React functional components with hooks
- TanStack Query for data fetching
- Zustand for client state
- Tailwind CSS for styling (no CSS modules)
- File-based data model (no ORM/database)

## Testing
- Browser tests via Playwright
- Smoke tests via Node.js scripts
- Manual validation via dashboard UI

## Review Process
- Self-review via Claude Code
- Iterative refinement based on Finetune.txt feedback

## Track Workflow
1. Create track with spec + plan
2. Implement phase by phase
3. Verify each phase before proceeding
4. Mark tasks complete in plan.md
5. Final verification against acceptance criteria
