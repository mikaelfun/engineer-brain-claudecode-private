---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Context Based Redirection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FSandbox%2FIn-Development%20Content%2FContext%20Based%20Redirection"
importDate: "2026-04-05"
type: troubleshooting-guide
---

**Description:** This folder is used to contain content that is being developed and is not yet ready for consumption.

**Please Note:** Whilst content is stored within this folder, it is not ingested into DFM Copilot.

---

## Overview

Context Based Redirections is a server-side security capability for Azure Virtual Desktop (AVD) and Windows 365 (Cloud PC) that allows IT admins to dynamically enable or disable RDP redirection features (clipboard, drive, printer, USB, etc.) based on Microsoft Entra Conditional Access Authentication Contexts.

Instead of relying on client-side enforcement, the redirection decision is made at connection time, based on claims issued by Entra and enforced by the AVD / W365 backend (RD Broker / Gateway).

### What customer problem does it solve?

Customers need granular, tamper-resistant control over data exfiltration risks when users connect from:
- Personal (BYOD) devices
- Unmanaged or non-compliant devices
- Untrusted networks

Existing solutions (e.g., Intune MAM) are:
- Client-side
- OS-dependent
- Easier to bypass on BYOD devices

Context-based redirections address DLP, compliance, and zero-trust scenarios without relying on endpoint trust.

### High-level value proposition

- Server-side enforcement (not client-trust dependent)
- Uses Entra Conditional Access as the policy engine
- Supports AVD and Windows 365
- Granular per-redirection control
- Works across Windows App and Web client
- Enables secure by default redirection behavior

## Requirements

### Supported platforms & services

- Azure Virtual Desktop (AVD)
- Windows 365 (Cloud PC)
- Microsoft Entra ID with Conditional Access
- Entra Authentication Context

### Supported OS (Session Hosts)

- Windows 11

### Supported clients

- Windows Web Client
- Unsupported:
  - Windows App (all platforms) during Private Preview
  - Client support beyond Web Client during preview.

### Licensing

- Microsoft Entra ID P1 (required for Conditional Access and Authentication Context)

### Scope

- Applies at:
  - AVD Host Pool level
  - Windows 365 device group via Intune settings

## Architecture

### High-level architecture description

The architecture relies on Conditional Access authentication contexts flowing from Microsoft Entra into the AVD or Windows 365 session, where those claims are mapped to redirection enforcement policies.

### Main components

- Microsoft Entra ID
  - Authentication Context
  - Conditional Access (CA) policies
- AVD / Windows 365 backend
  - RD Broker
  - RD Gateway
- Client (Web / Windows App)
- Settings Framework
  - Azure Portal (AVD)
  - Intune (Windows 365)

### Data & control flow

1. User initiates connection to AVD / Cloud PC.
2. Client authenticates against Entra ID.
3. Client explicitly requests Authentication Context IDs.
4. Entra evaluates CA policies and issues an access token with acrs claims.
5. Token is sent to RD Broker.
6. RD Broker compares:
   - Token acrs claims
   - Configured redirection interpretation rules
7. Final RDP properties are generated and enforced.

### Control plane vs data plane

- Control Plane
  - Entra Conditional Access
  - Authentication Context definition
  - Admin configuration (Azure Portal / Intune)
- Data Plane
  - RDP connection establishment
  - Redirection enforcement via RD Broker / Gateway

#### CSS-relevant integration points

- Entra CA policy behavior (block-based vs allow-based)
- Token claims (acrs)
- RD Broker enforcement logic
- Settings priority / conflict resolution

## Limitations

- Drive redirection cannot be disabled via auth context (hotfix pending).
- USB redirection cannot be disabled on Windows 365 Cloud PC.
- Only Web client supported during Private Preview.

### Behavioral limitations

- CA policies must be block-based to avoid unintended claim issuance.
- Policy changes only apply on new connections.
- No native end-user UI to explain why redirections are disabled.

### Preview vs GA

- Feature behavior exists in Web client today, expanding to all clients post-GA.

## Prerequisites

### Tenant prerequisites

- Entra ID tenant with P1 license.
- Authentication Contexts created.
- Conditional Access enabled.

### Identity & policy prerequisites

- Block-based CA policies.
- Authentication Context assigned to CA policies.
- CA policies set to On (not Report-only).

### Service prerequisites

- AVD host pool or W365 Cloud PC available.
- Intune access (for W365 settings).

## Resources

- [Deep Dive Recording](https://microsoft.sharepoint.com/:v:/r/teams/css-rds/Learning/AVD/Context%20Based%20Redirection/)
- [QA Learning Path](https://platform.qa.com/learning-paths/azure-virtual-desktop-avd-w365-feature-feature-context-based-redirection-1854-17828/)
