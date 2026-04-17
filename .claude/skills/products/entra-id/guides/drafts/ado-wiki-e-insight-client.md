---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Tools/Insight Client"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Tools/Insight%20Client"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1334569&Instance=1334569&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1334569&Instance=1334569&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** Insight Client is a companion tool to Insight Web that allows users to explore event tracing, convert Event Trace Log (ETL) files to human-readable formats, and perform bulk operations. This guide provides an overview of its features, download instructions, configuration tips, and ways to improve conversion speed.

[[_TOC_]]

# Description
This internal article provides a toolset overview and answers frequently asked questions:

- [KB4648354](https://internal.evergreen.microsoft.com/en-us/topic/8084a2bb-0bf2-5c63-e927-fed88318f18b) - Insight Client - An event tracing helper tool
  -  ShortURL: https://aka.ms/insightclient

# How to get
- Download URL: [https://cesdiagtools.z16.web.core.windows.net/insightclient64/insider/InsightClient.application](https://cesdiagtools.z16.web.core.windows.net/insightclient64/insider/InsightClient.application)

# Configuration
Insight Client's configuration can be accessed via the "settings" button on the main screen:

![image.png](/.attachments/image-d3e6c7da-cd58-4e58-b04f-0e7482bbff0c.png)

- You can configure Insight Client Shell Extension to allow you to right-click an ETL file and convert it instead of having to open the tool to do it.
- The log viewer app that is launched at the end of the conversion can also be configured. The default is TextAnalysisTool.

## Improving conversion speed
There's a setting in Insight Client that allows you to change which servers you are using to grab the Trace Message Format (TMF) file (the manifests used to convert files). This setting allows you to use either the US servers (default setting) or the UK servers. Depending on your location, changing this setting can decrease the time it takes to pull the TMF files, thus increasing the speed of the conversion.

To change this setting, open Insight Client, press "settings," choose either server location, and press "Save and Close" for the change to take effect.

![image.png](/.attachments/image-0c9881c9-5d70-4a03-8f6b-ef4a9370a6d6.png)
