---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: LSASS high handles/Data Collection - LSASS High Handles"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20LSASS%20high%20handles/Data%20Collection%20-%20LSASS%20High%20Handles"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1569493&Instance=1569493&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1569493&Instance=1569493&Feedback=2)

___
<div id='cssfeedback-end'></div>

## ADPerf - Data collection for LSASS high handles

**Summary:** This guide explains how to use the ADPerf script to collect data for troubleshooting issues related to the Local Security Authority Subsystem Service (LSASS) consuming a high handle count. It focuses on utilizing Scenario 5 of the ADPerf script.

[[_TOC_]]

### Abstract

This page describes the method to collect data for analysis when troubleshooting an issue related to LSASS consuming a high handle count. The ADPerf script is the recommended tool to collect the required dataset (Scenario 5 covers high LSASS handles scenarios).

### Instructions

Use Scenario 5 from the [ADPerf script](https://internal.evergreen.microsoft.com/en-us/topic/d4959f71-e2bd-061e-4acd-a0b48c52d766) to collect a dataset for LSASS high handles:

![Scenario 5 Screenshot](/.attachments/image-1c684fae-4f8a-4490-bf5b-5b7a66c711a4.png)

### What is collected with this scenario

- **Windows Performance Recorder (WPR) for Handles**: Runs the following command: `WPR.exe -Start Handle`
- Collects long and short running **perfmon**.

This scenario also collects general counters, as with all other scenarios:

- Enables **1644 Active Directory (AD) events** with default thresholds.
- Enables **Netlogon Debug** logging with flags `0x2080ffff`.
- Starts either the custom **AD Data Collector Set** including the 1644 tracing or the built-in Data Collector Set depending on the configuration.
- **Local Security Authority (LSA)** and **Layered Service Provider (LSP)** tracing.
- **SamSrv** tracing.
- **Tasklist /svc** and `tasklist /v`.
- **Dcdiag** report.
- **Netstat** report.
- Copies **Ntdsai.dll**, **Samsrv.dll**, **Lsasrv.dll**, and **Ntdsatq.dll** to the central data path.
- Copies **Directory Service.evtx** to the central data path.


**All screenshots, machine name references, IP addresses, and log outputs are from internal lab machines and not customer data.**