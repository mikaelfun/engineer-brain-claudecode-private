---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Common/DNS Suffixes"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FDNS%20Suffixes"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# DNS Suffixes and Suffix Search Lists in Windows

[[_TOC_]]

# Introduction

Domain Name Suffix Search Lists are used by Windows to simplify DNS name resolution by appending suffixes to queried partial names.

# Default Behavior by Scenario

## Azure-Provided DNS

Azure DHCP provides internal DNS suffix `.internal.cloudapp.net` (via DHCP option 15) to each VM. Host name records are in the `internal.cloudapp.net` zone.

## Custom DNS

When using a custom name resolution solution, Azure does **not** supply `.internal.cloudapp.net`. Instead, a non-functional placeholder `reddog.microsoft.com` is provided (to avoid interfering with other DNS architectures like domain-joined scenarios).

## Domain-Joined

When a Windows client is domain-joined, the primary DNS suffix is appended to queries.

## Suffix Search List (NIC Settings)

If a suffix search list is defined in NIC Advanced TCP/IP properties, Windows appends suffixes in listed order instead of the primary DNS suffix.

Example search list: `corp.example.com`, `internal.example.net`, `example.org`

# Relative Names vs FQDN

**Important distinction:**

- A **relative name** (e.g., `microsoft.com` without trailing dot) causes the resolver to append suffixes from the search list before attempting the bare name:
  1. `microsoft.com.corp.example.com`
  2. `microsoft.com.example.com`
  3. `microsoft.com`
  
  This can cause **delays or unintended matches** if a similar internal name exists.

- An **FQDN** (e.g., `microsoft.com.` with trailing dot) is queried directly — no suffix appending.

> **Troubleshooting tip:** When investigating DNS resolution issues, always test with FQDN (trailing dot) to isolate suffix search list effects.

# Contributors
- @d0edd9ce-b52c-65a6-8306-a5afe67d544d
