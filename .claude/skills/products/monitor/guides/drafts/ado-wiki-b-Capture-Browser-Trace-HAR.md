---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/General/How to capture a browser trace (HAR) for troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAzure%20Monitor%2FHow-To%2FGeneral%2FHow%20to%20capture%20a%20browser%20trace%20(HAR)%20for%20troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Introduction

To investigate portal-related issues, one of the first steps is to collect a browser trace (HAR file) and also console logs (required to escalate issues to the PG).

# Instructions

To troubleshoot portal issues, it is important to gather a browser trace (HAR file) and console logs. To do this, follow these instructions:

1. To capture the specific problem you are having, only start the trace when you are about to reproduce the issue, and stop it right after the issue has occurred. For example, if a page is not loading or a button is causing an error, start the trace just before you try to load the page or click the button, and stop it immediately after the issue has happened.

2. Close any other unnecessary browsers or applications that may generate HTTP/S traffic during the trace, to avoid capturing unrelated data.

3. To collect a HAR trace, follow the steps in this public article: [Capture a browser trace for troubleshooting](https://learn.microsoft.com/en-gb/azure/azure-portal/capture-browser-trace). You can share this link with customers so they can collect the trace themselves, or you can use the shorter URL: https://aka.ms/browsertrace.
