---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/ACE Identity TSGs/Identity Technical Wiki/What is RamLogData in Auth Troubleshooter?"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FACE+Identity+TSGs%2FIdentity+Technical+Wiki%2FWhat+is+RamLogData+in+Auth+Troubleshooter%3F"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# What is RamLogData in Auth Troubleshooter?

## What is RAMlog?

RAM, the Risk Assessment Module, is an ESTS runtime execution engine that drives the execution of all online protection algorithms.

Each protection algorithm executes as one or several execution units. These execution units process input request data, log data in RamLogData, and may issue recommendations.

Unless there are unexpected errors, RAM will always execute all execution units that can be executed. RAM execution is never aborted midway intentionally, only through unexpected errors.

Each execution unit has its own logic to determine whether it is enabled and whether it has all the data necessary for its processing.

Once RAM completes the execution of all its units, it aggregates all the recommendations at several levels.

### A recommendation consists of:

- **Recommendation Action**: Describes what RAM suggests (block, mark risky, etc.)
- **Recommender Id**: Identifies the algorithm that made the recommendation

### RAM produces 3 aggregated recommendations:

1. **Overall recommendation** - covers all recommendations; this is the main RAM output
2. **Account risk recommendation** - covers only account risk recommendations; drives CA Account Risk policies
3. **Session risk recommendation** - covers only session risk recommendations; drives CA Session Risk policies

## What information does RamLogData hold?

- Captures all details of RAM execution for a request
- Each execution unit logs a set of entries grouped by algorithm (common prefix)
- Much detail requires intimate understanding of algorithm implementation and ESTS configuration

## Key RAM Action Codes

### Session or Account Risk Actions

| Code | Action | Description |
|------|--------|-------------|
| 0 | RamActionNotSet | Uninitialized action value (should not appear) |
| 1 | RamActionDoNotDisturb | RAM found nothing to complain about |
| 40 | RamActionSessionRiskLow | Low session risk |
| 50 | RamActionAccountRiskLow | Low account risk |
| 60 | RamActionSessionRiskMedium | Medium session risk |
| 70 | RamActionAccountRiskMedium | Medium account risk |
| 80 | RamActionSessionRiskHigh | High session risk |
| 90 | RamActionAccountRiskHigh | High account risk |
| 100 | RamActionBlock | RAM decided to block the request. Highest priority - executed by RAM, not CA. Request fails without CA getting a chance to execute. |

### OfflineRiskScoreData

- **AccountRiskScore**: See values of OfflineRiskScore
- **AccountRiskEventTime**: Time of the event that triggered risk evaluation
- **AccountRiskScoreComputationTime**: Time when risk evaluation updated the score

## Further Reading

For all RamLogData actions, see: https://aadwiki.windows-int.net/index.php?title=RamLogDataDetails
