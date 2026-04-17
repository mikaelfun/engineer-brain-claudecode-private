---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Archive/Agents and Log Analytics/Azure Monitoring Agent (AMA)/[Product Knowledge] MDC Auto-Provisioning using AMA"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FArchive%2FAgents%20and%20Log%20Analytics%2FAzure%20Monitoring%20Agent%20(AMA)%2F%5BProduct%20Knowledge%5D%20MDC%20Auto-Provisioning%20using%20AMA"
importDate: "2026-04-05"
type: troubleshooting-guide
note: "DEPRECATED — This feature is deprecated; wiki article is set to be removed. Content preserved for historical reference."
---

> **Note:** This feature is already deprecated, this wiki article is set to be removed soon as it's no longer applicable.

# Overview

- The MDC Auto-Provisioning experience is built on top of Policy framework.

- MDC is available using either the system-defined workspace(s) (default) or a user-defined workspace. There are 2 Policy Initiatives that the auto-provisioning uses:
  1. A policy initiative for using the system-defined workspaces
  2. A policy initiative for using the user-defined workspace

**Note**: Policy framework's *deployIfNotExists* policies work in a way that newly created VMs and modified VMs are automatically executed. In order for the policies to be executed on existing VMs as well, remediation tasks are required.

- When auto-provisioning is enabled and saved, MDC does 2 main actions:
  1. Assign the relevant policy initiative to the subscription.
  2. Create remediation tasks for all of its nested policies.

# Components Created by the MDC Auto-Provisioning using AMA

The MDC auto-provisioning is responsible for:
- Creating the LA system workspace (if using the default) and installing the corresponding security solution
- Creating the Microsoft security DCR (per each workspace)
- Creating a DCR-A to link each VM to the relevant DCR
- Installing AMA + User-Assigned identity
- Installing ASA (Azure Security Agent)

## Pipeline Components

| Component | Responsibility |
|-----------|----------------|
| Policy Initiative (system workspace) | Assigns AMA + identity + ASA + DCR creation |
| Policy Initiative (user workspace) | Same but targets custom Log Analytics workspace |
| Remediation Tasks | Ensures existing VMs are also provisioned |
| DCR | Defines which security data streams to collect |
| DCR-A | Links each VM to its corresponding DCR |
