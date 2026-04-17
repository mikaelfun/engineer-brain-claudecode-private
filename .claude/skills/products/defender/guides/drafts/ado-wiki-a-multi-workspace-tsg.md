---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/[TSG] - Multi Workspace"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/[TSG]%20-%20Multi%20Workspace"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Multi Workspace TSG

## Overview

- **Primary Workspace**: Exactly one. Receives all non-Sentinel alerts + its own Sentinel alerts. Alerts correlated with XDR data.
- **Secondary Workspaces**: All others. Receive only their own Sentinel alerts. XDR generates incidents but only for alerts within that workspace.
- Alerts from all workspaces visible in USX portal (filtered by user permissions).
- One workspace per incident: secondary alerts only with same-workspace alerts; primary alerts can be with XDR alerts.

## Azure Portal Behavior

For onboarded tenants, all XDR-related connectors are blocked from changes in all workspaces. Message: "One or more of your workspaces are onboarded to Unified Security Operations Platform. Incidents and alerts configuration is disabled."

## Permission Mapping (Azure to USX)

| USX Role | Required Azure Permissions |
|---|---|
| Security Data Manage | `workspaces/read`, `workspaces/query/read`, `incidents/read+write`, `incidents/comments/read+write`, `incidents/relations/read+write`, `incidents/tasks/read+write` |
| Security Data Read | `workspaces/read`, `workspaces/query/read`, `incidents/read`, `incidents/comments/read`, `incidents/relations/read`, `incidents/tasks/read` |
| Security Config Manage | `workspaces/read`, `securityinsights/register/action`, `securityinsights/unregister/action`, `onboardingstates/write+delete`, `settings/write+delete` |

## Required App Registrations

| App | App ID | Required Role |
|---|---|---|
| Microsoft Threat Protection | `8ee8fdad-f234-4243-8f3b-15c294843740` | Sentinel Contributor |
| WindowsDefenderATP | `fc780465-2017-40d4-a0c5-307022471b92` | Sentinel Contributor |

## Onboarding Requirements

- **Subscription Owner** or **Sentinel Contributor + User Access Administrator**
- Global Admin and Security Admin can manage already-onboarded workspaces and workspaces they own

## Advanced Hunting

- Custom detections with Sentinel/alerts tables (AlertInfo, AlertEvidence) -> primary workspace only
- Link to incident with XDR + Sentinel tables -> primary workspace only
- Secondary workspace link-to-incident -> Sentinel-only queries (no XDR joins)
- AlertInfo/AlertEvidence results filtered by selected workspace

## Known Issues

1. Alerts from Alerts tables tagged with Sentinel product and primary workspace even if data not from Sentinel
2. Reopen closed incident not yet supported - alerts with "Reopen Closed Incident" rule correlated in new incident instead
