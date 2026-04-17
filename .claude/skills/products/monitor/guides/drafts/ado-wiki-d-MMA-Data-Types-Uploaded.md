---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to check what data types being uploaded by MMA machine"
sourceUrl: "https://dev.azure.com/Supportability/6f9dfd80-6071-4f7b-8bf9-c97214ca68cf/_wiki/wikis/bebfc12e-d2ce-4ed1-8a64-d64c20264fd2?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FHow-To%2FHow%20to%20check%20what%20data%20types%20being%20uploaded%20by%20MMA%20machine"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]


# Symptom:
Sometimes its important to learn what Data types being uploaded by MMA agent being investigated.

**Kusto Query to learn Data Types "tables" received from respective Machine** 
search * | where Computer contains "dc1"
| summarize by Type




![image.png](/.attachments/image-98cf27b3-9581-4dc0-9de1-46061cf4256d.png)
