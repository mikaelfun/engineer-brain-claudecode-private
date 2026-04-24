---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Grouping And Targeting"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FGrouping%20And%20Targeting"
importDate: "2026-04-23"
type: guide-draft
---

# Intune Grouping and Targeting (GnT) Guide

## Overview
GnT is the process of assigning and deploying Intune payloads (policies, apps, settings) via Entra ID groups.

## Key Concepts
- **Effective Group Membership (EGM)**: Each user/device has exactly 1 effective group combining all AAD group memberships
- EGM is pre-computed for performance (avoids real-time AAD queries during check-ins)
- Payload targeting is resolved against EGM, not raw AAD groups

## Troubleshooting
- Compare EGM across devices to find group membership differences
- Check if recent group additions/removals caused unintended policy changes
- EGM changes require service-side sync before taking effect
