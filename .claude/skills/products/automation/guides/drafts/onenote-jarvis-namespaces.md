# Jarvis Namespaces for Azure Automation (Mooncake)

## Source
- OneNote: Mooncake POD Support Notebook > AUTOMATION > Troubleshooting > Jarvis

## Namespace Reference

### OaasMKWebBjbs1 — Web Role (Portal/Account)
| Table | Purpose |
|-------|---------|
| ETWAll | All logs |
| ETWjobID | Filter by automation job request only |
| ETWHighPriority | Query only for log error |

**Use for**: Portal issues, account login issues, incoming requests from front door, account validation.

### OaasMKTriggerBjbs1 — Trigger Service (Schedules)
| Table | Purpose |
|-------|---------|
| ETWAll | All logs |
| ETWHighPriority | Query only for log error |
| TriggerOperations | Trigger operation with result (next job execution time) |
| TriggerExceptions | Trigger operation with error |

**Use for**: Automation schedule issues, trigger debugging.

### OaasMKWebhookBjbs1 — Webhook Service
| Table | Purpose |
|-------|---------|
| ETWAll | All logs |
| ETWHighPriority | Query only for log error |

**Use for**: Incoming webhook request issues.

### OaasMKProdBjbs1 — Job Execution (Runbook Worker)
| Table | Purpose |
|-------|---------|
| ETWAll | All logs |
| ETWjobID | Filter by automation job request only |
| ETWHighPriority | Query only for log error |

**Use for**: Job execution on runbook workers, sandbox events.

## Notes
- Replace `MK` with region code for other regions (e.g., `Bjbs1` = Beijing)
- These are 21v/Mooncake specific namespaces
