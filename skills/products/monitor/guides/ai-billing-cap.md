# Monitor Application Insights 计费与每日上限

**Entries**: 5 | **21V**: ALL | **Sources**: 2
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Application Insights Daily Cap reset time shown in portal UI is incorrect; at... | In Fall 2024, all Application Insights resources globally had their Daily Cap... | Use AppLens (applens.trafficmanager.net) → look up the Application Insights r... | 8.5 | ADO Wiki |
| 2 | Cannot configure Daily Cap reset time in Application Insights, setting is not... | Daily Cap reset time is no longer user-configurable. Platform standardized re... | By design. Daily Cap reset time is managed by the platform. No plans to make ... | 8.5 | ADO Wiki |
| 3 | Azure portal only allows setting Application Insights Daily Cap up to 1TB but... | Portal UI limits Daily Cap to 1TB. Actual platform maximum is 3TB via PowerSh... | Use PowerShell cmdlet to set values up to 3TB. For >3TB: use separate AI comp... | 8.5 | ADO Wiki |
| 4 | Cannot add tags, custom tables, DCR, or other resources to Application Insigh... | Deny Assignment blocks: new workspace creation, tag operations, custom tables... | By design. Re-associate AI to user-owned LA workspace for full control. Do no... | 8.5 | ADO Wiki |
| 5 | Log Analytics workspace receives less telemetry than daily cap allows; daily ... | A Data Collection Rule (DCR) filters/reduces telemetry volume before it reach... | Review and modify or delete the DCR to allow full telemetry volume to reach t... | 6.5 | MS Learn |
