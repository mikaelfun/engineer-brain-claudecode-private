---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Copilot In Intune/Device Offboarding Agent"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FCopilot%20In%20Intune%2FDevice%20Offboarding%20Agent"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Device Offboarding Agent

**DEPRECATION NOTE:** Feature entered deprecated status on March 2, 2026, and will be removed from the Intune UI on June 1, 2026.

## Overview
**Goal:** Reduce attack surfaces by identifying devices no longer under Intune management but still present in Entra.

**What it does:** When a device is removed from Intune, the record lingers in Entra. Device Offboarding Agent identifies these devices and provides a list of recommended actions for proper cleanup. Currently provides one-click assisted remediation for disabling devices in Entra.

**Current scope:**
- Intune retired/wiped/deleted devices in the last 30 days
- Platforms: Android, iOS/iPadOS, macOS, Linux
- Ownership: BYOD, corporate

**Out of scope:** Windows devices, Shared devices, Hybrid Entra-joined Windows devices, Microsoft Teams Phones

## Feature Flow
1. Intune agent looks for identity mismatches and learns from org custom instructions to recommend devices for offboarding
2. IT Admin completes prerequisites and approves devices for offboarding from Entra
3. Intune agent using Entra APIs disables the devices in Entra console (reversible action)

## RBAC Requirements

### To create/delete the agent:
- Intune: Microsoft.Intune/Audit/Read (Read only operator)
- Entra: Microsoft.Directory/Devices/Standard/Read (Security Reader)
- Security Copilot: Copilot owner

### To run the agent:
- Intune: Microsoft.Intune/Audit/Read (Read only operator)
- Entra: Microsoft.Directory/Devices/Standard/Read (Security Reader)
- Security Copilot: Copilot contributor

### To disable devices:
- Entra: Microsoft.Directory/devices/disable
- Entra: Microsoft.Directory/Devices/Standard/Read
- Intune: Audit Data/Read, Organization/Read, Managed devices/Read (or Read Only Operator)

## Expected Scenarios

| Platform + Ownership | Recommended Actions |
| - | - |
| iOS/iPadOS personal (BYOD), macOS personal (BYOD), Linux personal + corporate | Download CSV → Remove from Defender → Disable in Entra |
| iOS/iPadOS corporate | Download CSV → Remove from ABM/ASM → Disable in Entra |
| macOS corporate | Download CSV → Remove from Defender → Remove from ABM/ASM → Disable in Entra |
| Android personal (BYOD), Android Corporate | Download CSV → Disable in Entra |

NOTE: Windows (non-Autopilot) corporate and Windows personal devices are automatically cleaned up in Entra when removed from Intune.

## Known Issue
Active CRI for Windows Autopilot devices — will be resolved (targeting 2601) after which these devices will appear in the agent suggestions.

## Deprecation Timeline (MC1242767)
- **April 30, 2026:** Agent can no longer be set up. If deleted after this date, cannot be re-created.
- **June 1, 2026:** Agent removed from Intune admin center.

### Customer Talking Points (CELA Approved)
- **Why deprecated:** Customer feedback shows device offboarding varies greatly per organization. Microsoft is exploring more integrated and flexible ways to support offboarding.
- **What to use instead:** Customers should offboard devices the way they did prior to using the agent.
- **Can existing users continue?** Yes, until June 1, 2026 (if set up before April 30, 2026).
- **Other available agents:** Policy Configuration Agent, Change Review Agent, Vulnerability Remediation Agent.
