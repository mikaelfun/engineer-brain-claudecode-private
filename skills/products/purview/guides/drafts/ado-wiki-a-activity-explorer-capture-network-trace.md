---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Activity Explorer/How to: Activity Explorer/How to: Capture a network trace for activity explorer"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FActivity%20Explorer%2FHow%20to%3A%20Activity%20Explorer%2FHow%20to%3A%20Capture%20a%20network%20trace%20for%20activity%20explorer"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to: Capture a Network Trace for Activity Explorer

## Introduction

This document will show how to capture a network trace log for Activity Explorer issues.

## Prerequisites

- Access to the Activity Explorer page in the Purview portal.
- Ability to run the Developer tools in the browser.

## Step-by-Step Instructions

### Step 1: Start the Network Trace

- Refer to the [Developer Tools Capture Instructions](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9071/How-to-Capture-a-network-trace?anchor=developer-tools-capture-instructions) for detailed general instructions.
  - Open the Activity Explorer page and start the network trace using the steps mentioned in the above link.
  - Refresh the page after starting the trace to make sure we are getting all the requests from the beginning.
  - Click on the **'Customize columns'** and select **'Record Identity'** column.
  - If the issue is specific to any event, copy the **'Record Identity'** value for that event.
  - Please make sure that the trace should have **`"apiproxy/di/search/LabelAnalyticsActivityData"`** API call with right parameters.
  - Export the network trace and get it.
