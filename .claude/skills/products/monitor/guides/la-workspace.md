# Monitor Log Analytics 工作区管理

**Entries**: 2 | **21V**: ALL | **Sources**: 1
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Log Analytics workspace solution cannot be removed via Azure Portal, CLI (az ... | The solution underlying Intelligence Pack may still be enabled in the workspa... | 1) Check if Intelligence Pack is disabled: use Workspace Dashboard Tool or Ge... | 8.5 | ADO Wiki |
| 2 | Customer cannot recover a recently deleted Log Analytics workspace even withi... | Workspace was deleted using the force parameter which permanently deletes the... | Verify using Kusto query on armprodgbl.eastus cluster (ARMProd database): que... | 6.0 | ADO Wiki |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/la-workspace.md)
