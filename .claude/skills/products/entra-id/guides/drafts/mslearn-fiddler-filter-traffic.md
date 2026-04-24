---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/app-integration/filter-fiddler-traffic-using-domain-name-client-process
importDate: "2026-04-24"
type: guide-draft
---

# Filter Fiddler Traffic by Domain and Process

## Method 1: Built-in Filter
Filters tab > Use Filters > Hosts > Show only the following Hosts
Enter semicolon-separated hosts: localhost;login.microsoftonline.com;graph.microsoft.com
Can also filter by Client Process.

## Method 2: JavaScript in OnBeforeRequest
Rules > Customize Rules > Add JavaScript code to OnBeforeRequest function.
Filter by host array and processlist array. Set oSession["ui-hide"] = null for matching sessions.
Useful for browser-based apps where process filtering is less effective.
