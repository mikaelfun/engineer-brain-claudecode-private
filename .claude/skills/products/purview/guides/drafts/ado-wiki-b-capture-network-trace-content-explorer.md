---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Data Explorer/How to: Data Explorer/How to: Capture a network trace for Content Explorer"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FData%20Explorer%2FHow%20to%3A%20Data%20Explorer%2FHow%20to%3A%20Capture%20a%20network%20trace%20for%20Content%20Explorer"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Introduction

This document will show how to capture a network trace log for Content Explorer issues.

# Prerequisites

To follow these steps, you will need:

- Access to the Content Explorer page in the Purview portal.
- Ability to run the Developer tools in the browser.

# Step by Step Instructions

## Step 1: Start the Network trace 

- Refer the [Developer Tools Capture Instructions](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9071/How-to-Capture-a-network-trace?anchor=developer-tools-capture-instructions) to get detailed general instructions.
  - Open the Content Explorer page and start the network trace using the steps mentioned in the above link.
  - Refresh the page after starting the trace to make sure we are getting all the requests  from the beginning.
  - Wait to load the page.
  - Export the network trace and get it.
