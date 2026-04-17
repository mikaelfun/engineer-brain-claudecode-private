---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Archive and Restore/Search, Archive, and Restoration Preview"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FArchive%20and%20Restore%2FSearch%2C%20Archive%2C%20and%20Restoration%20Preview"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Resolve Microsoft Sentinel Search and Restore issues

## Escalation Contacts

- Teams ICM channel: Sentinel US / Hunters
- Bug tracking: [FEATURE 12539994](https://msazure.visualstudio.com/One/_workitems/edit/12539994) Search Backlog

## Search Jobs

### Prerequisites

Before starting a search job, ensure you have one of the required roles:
- Microsoft Sentinel Contributor
- Azure Monitor Contributor
- Microsoft Sentinel Reader

### Limitations

- Optimized to query one table at a time
- Search date range is up to one year
- Supports long running searches up to a 24-hour time-out
- Results are limited to one million records in the record set
- Concurrent execution is limited to five search jobs per workspace
- Limited to 100 search results tables per workspace
- Limited to 100 search job executions per day per workspace

### Troubleshooting Search Jobs

- If you encounter a failure when creating a search job, hover your mouse over the info button next to the failure notification to get details.
- The status dialog for failed searches is removed when you refresh the Search page or visit a different page. To recreate the failed status dialog, resubmit the failing search job.
- **Important**: If you are not seeing expected results in a search results table over a given timeframe, make sure you are using `_OriginalTimeGenerated` column (not `TimeGenerated`) to see the original event time from the source table.

## Restoring Archived / Basic Log Tables

### Prerequisites

Before restoring a table, ensure you have one of the required roles:
- Microsoft Sentinel Contributor
- Azure Monitor Contributor
- Microsoft Sentinel Reader

### Limitations

- Minimum of 2 days of log data to restore
- Data to restore must be older than 14 days
- Upper limit of 60TB per single restore
- Up to 4 restores per workspace per week
- Up to 2 restore processes in a workspace can be concurrently running
- One active restore at a time per table

### Troubleshooting Restore Jobs

- If you encounter a failure when restoring a table, hover your mouse over the info button next to the failure notification to get details.
- **Restore failed - data already restored**: If the restore job failed because data from the target table is already restored, you need to delete the corresponding `<SourceTableName>_<RandomNumber>_RST` table using the delete action. Then you can submit a new restore job.
