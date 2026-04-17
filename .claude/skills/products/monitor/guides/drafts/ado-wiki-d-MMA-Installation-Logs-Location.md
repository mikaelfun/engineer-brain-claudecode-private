---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to locate MMA agent installation logs"
sourceUrl: "https://dev.azure.com/Supportability/6f9dfd80-6071-4f7b-8bf9-c97214ca68cf/_wiki/wikis/bebfc12e-d2ce-4ed1-8a64-d64c20264fd2?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FHow-To%2FHow%20to%20locate%20MMA%20agent%20installation%20logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]
This is a draft page being used to create article. 

# Scenario

The purpose of this article is to locate Agent installation or uninstallation installer log files.

Let's suppose the name of the user account is irfanr. If this user account is used to install or uninstall the agent, then installer log files be available at 

C:\Users\irfanr\AppData\Local\SCOM\LOGS

File names may be something like MomAgent0.log , Setup0.log

