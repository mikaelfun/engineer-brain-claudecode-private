---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: DC Unresponsive | Hang/Data Analysis Walkthrough"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A%20ADPERF%3A%20DC%20Unresponsive%20%7C%20Hang%2FData%20Analysis%20Walkthrough"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# DC Unresponsive/Hang Data Analysis Walkthrough

This document provides a detailed walkthrough for analyzing scenarios where a Domain Controller (DC) is hung or unresponsive. It covers log analysis, data analysis, and specific application complaints.

## Log Analysis: Scenario 1 and Scenario 2

- Filter the following event logs for warnings and errors leading up to the time of the issue reported by the customer:
  - System event logs
  - Directory service event logs
  - DNS event logs
  - Application event logs

- If more than one DC is affected, or the affected DC has been impacted more than once, look for a pattern in the events.
- Check if monitoring tools reported any errors or warnings leading up to the issue.
- Document all errors and search the Knowledge Base for any known issues.

## Scenario 3: Domain Controller is in the problem state at the moment

### Data Analysis (Cannot log on vs. Can log on)

**When you cannot log on to the DC:**
1. Filter event logs (System, Directory Services, DNS, Application, DFSR) for warnings/errors
2. Look for patterns across multiple DCs or repeated incidents
3. Check monitoring tool logs
4. Review network traces and document error messages
5. Document all errors/warnings and search KB
6. Send collaboration task with detailed symptoms and log analysis to EE queue for dump analysis

**When you can log on to the DC:**
1. Filter event logs (System, Directory Services, DNS, Application, Security 4624, DFSR) for warnings/errors
2. Review network trace filtered for application server IP — check for successful connections or data exchange
3. Review application logs for complaints about DC being unresponsive
4. Check monitoring tool logs
5. Review simultaneous network traces, AD ETL, and events for errors/failures
6. Document all errors/warnings and search KB
7. Send collaboration task to EE queue for dump analysis

## Scenario 4: Specific Applications Complaining Cannot Connect

### Data Analysis (Cannot log on vs. Can log on)

**When you cannot log on to the DC:**
1. Filter event logs (System, Directory Services, DNS, Application, DFSR)
2. Look for patterns across DCs
3. Check monitoring tools
4. Review network traces
5. Search KB for known issues
6. Send to EE queue for dump analysis

**When you can log on to the DC:**
1. Filter event logs (System, Directory Services, DNS, Application, Security 4624, DFSR)
2. Review network trace filtered for application server IP
3. Review application logs
4. Check monitoring tools
5. Review simultaneous network traces, AD ETL, events
6. Search KB for known issues
7. Send to EE queue for dump analysis
