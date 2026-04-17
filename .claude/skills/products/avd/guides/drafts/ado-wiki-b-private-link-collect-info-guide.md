---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/PL/TSG/Collect private link info"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FSandbox%2FIn-Development%20Content%2FOutdated%3F%20-%20Needs%20review%20if%20still%20useful%2FPL%2FTSG%2FCollect%20private%20link%20info"
importDate: "2026-04-06"
type: troubleshooting-guide
note: "Sandbox/In-Development content — may be outdated. Review before using."
---

# AVD Private Link — Collecting Private Endpoint Info from Customer

> ⚠️ This page is marked as in-development / possibly outdated. Review before using in production support.

Use this guide to gather the required private endpoint configuration details from the customer before diving into deeper troubleshooting.

## Step 1 — Ask Customer for Private Endpoint Names

Ask customer to provide:
- Global private endpoint name
- Feed global endpoint name
- Connection private endpoint name

### Get Global Private Endpoint Name
1. Customer goes to: **Workspace > Networking tab**
2. Select **Private Endpoint connection**
3. The private endpoint name is under **Private endpoint** column

### Get Feed Private Endpoint Name
1. Customer goes to: **Workspace > Networking tab**
2. Select **Private Endpoint connection**
3. The private endpoint name is under **Private endpoint** column

### Get Connection Private Endpoint Name
1. Customer goes to: **Host Pool > Networking tab**
2. Select **Private Endpoint connection**
3. The private endpoint name is under **Private endpoint** column

**Document the names:**
```
Global Private Endpoint Name: <name>
Feed Private Endpoint Name: <name>
Connection Endpoint Name: <name>
```

## Step 2 — Look Up in ASC

1. In ASC go to **Microsoft.Network > select privateEndpoints**
2. Select the **Global Private Endpoint**

### For Each Private Endpoint, Document:

```
[Global Private Endpoint]
Workspace Name: <name>
Is Workspace Empty? Yes/No

Firewall and virtual networks:
  Allow end users access from public network: True/False

Private Endpoint Connections:
  Name: <name>
  Connection State: <state>
  Private Endpoint: <name>
  Description: <text>

DNS Names: <list>
```

Repeat for Feed and Connection private endpoints.
