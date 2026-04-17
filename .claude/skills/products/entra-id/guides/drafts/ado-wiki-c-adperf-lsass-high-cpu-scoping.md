---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Lsass High CPU/Scoping for Lsass High CPU"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A+ADPERF%3A+Lsass+High+CPU%2FScoping+for+Lsass+High+CPU"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# ADPERF: LSASS High CPU Scoping Questions

Understand the nature of the problem and the pattern. This will help you decide the best method and time for data collection.

## Key Scoping Questions

- What is the Operating System of the affected Domain Controllers?
- When did the problem start / was first reported?
- What is the pattern of the issue? (Does it happen on all DCs, or DCs in some sites, or a specific one)
- What is / was the baseline of CPU usage on the Domain Controller prior to the issue?
- How long has the problem been happening?
- If the CPU spike is intermittent, is there a time or sequence where the problem is more likely to occur? (To determine when and how to collect data)
- What changes have been made since the problem started?
- How long does the CPU spike last? (constant, 10 Minutes, 1 Minute etc.)
- Can the customer reproduce the issue by running some commands, or performing some specific activity, or pointing some application servers to the DCs in question?
- What is the specific role of the domain controller exhibiting the high CPU usage? (FSMO, ring-fenced to applications like Exchange, Teams, part of a Load Balanced VIP etc.)
- Is just the Lsass.exe process spiking, or are other processes also affected? (Example: Security software, Quest AD Tools, System process etc.)
- Do you run Endpoint Management Software such as Tanium which allow wide-spread deployment of scripts to client endpoints? If so, have you contacted that vendor to check whether an action taken there contributed to this issue?

## Reference

ADPERF Troubleshooting Sessions by lindakup, justintu and waynmc:
https://aka.ms/adperfninja
Lesson 1 & 2 Overview, Scoping and Data Collection
