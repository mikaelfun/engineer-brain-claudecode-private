---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Endpoint Security/Tenant Attach"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FTenant%20Attach"
importDate: "2026-04-23"
type: guide-draft
---

# Tenant Attach Troubleshooting Guide

## Overview
Tenant attach syncs ConfigMgr devices to Intune for endpoint security policy deployment (one-way sync).

## Requirements
- Configuration Manager with tenant attach configured
- Collections enabled for endpoint security policies
- Global Administrator permissions to Azure AD
- Microsoft Defender for Endpoint tenant integrated with Intune

## Configuration Tasks
1. Confirm ConfigMgr environment and version requirements
2. Configure tenant attach and synchronize devices
3. Select devices to synchronize
4. Enable collections for endpoint security policies

## Scoping Questions
1. Full error description
2. Steps to reproduce
3. PolicyID, userID, deviceID
4. Device type: Intune enrolled / co-managed / tenant attached / MDE attached
5. Was this previously working? Last change before issue?

## Support Boundaries
| Feature | Transfer To |
|---------|-------------|
| Defender Application Guard | Windows UEX |
| Defender Firewall | Windows Networking |
| Defender SmartScreen | Azure Security |
| Windows Encryption | MSaaS Windows Devices |
| Defender Exploit Guard | Azure Security |
| Defender Application Control | MSaaS Windows Devices |
| Defender Credential Guard | MSaaS Windows Devices |
| Defender Security Center | Azure Security |
| Local device security options | Intune |
| User Rights | MSaaS Windows Devices |
