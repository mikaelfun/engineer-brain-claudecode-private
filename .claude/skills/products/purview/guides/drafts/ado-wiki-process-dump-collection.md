---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/How to capture logs & traces/Process dump collection"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FHow%20to%20capture%20logs%20%26%20traces%2FProcess%20dump%20collection"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Process Dump Collection (DebugDiag)

## Steps
1. Download & install DebugDiag (https://www.microsoft.com/en-us/download/details.aspx?id=58210)
2. Launch DebugDiag → Rule Wizard
3. Select "Crash" → Next
4. Select "A Specific Process" → Next
5. Select the crashing process (or enter process name if not running)
6. Configure Advanced: set max userdump limit (default 3) → Next
7. Name the rule, note dump storage path → Next
8. Activate the rule
9. Run the process and wait for crash
10. Dumps generated in "Crash Rule for AllInstances of..." folder

## Dump File Format
`<ProcessName>__PID__<PID>__Date__<Date>__Time_<Time>__SecondChance_<ExceptionName>.dmp`

## Cleanup
After collecting, delete or deactivate the rule in DebugDiag.
