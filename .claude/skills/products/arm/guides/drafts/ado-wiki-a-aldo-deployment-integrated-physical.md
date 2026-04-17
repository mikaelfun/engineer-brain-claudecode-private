---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Beta Resources - Pre-GA/Deployment/Integrated Physical"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Beta%20Resources%20-%20Pre-GA/Deployment/Integrated%20Physical"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Integrated Physical Deployment (HCI + Winfield)

For 3+ node physical environments, follow the [ASZ Private Preview Modules](https://microsoft.sharepoint.com/teams/ASZ/Shared%20Documents/Forms/AllItems.aspx?FolderCTID=0x012000CA1AD89D04863B4F8C86B2EE3084909E&id=%2fteams%2fASZ%2fShared+Documents%2fArc-A%2fArc-A+Selfhost+Documents%2fPrivate+Preview+Modules) to deploy Azure Stack HCI manually with Winfield PP2 (**complete Modules 1-4 and then Module 14**).

## Public Preview Design
The current design mirrors the standard Azure Stack HCI process (same as Dell Anacortes appliance). The "new thing" is deploying and configuring the disconnected operations appliance on the first cluster (integrated cluster).

## Step-by-Step Deployment (Greenfield 3+ Node)

**Step 1 — Prepare Nodes:**
- Customer installs HCI OS, configures networking, installs certificates (if using private PKI)
- ⚠️ **Do NOT initialize AzStackHCI on any nodes** at this stage

**Step 2 — Setup vSwitches:**
- Two NICs (Management & Ingress) on the Appliance VM
- Connect via HCI network intents

**Step 3 — Install Winfield on Seed Node:**
- Choose one node as the "seed node"
- Use Winfield module (PowerShell script): install VHD, set up VM, configure, integrate with customer data center hardware
- Prerequisites: identity provider (AD + ADFS), certificates
- Result: local control plane is active

**Step 4 — Initialize HCI:**
- Customer runs the same HCI initialization command as in Azure (standard process)
- Brings down the "device management extension" from Winfield appliance to every node
- Also brings "LCM extension" on every node
- ARC enables all nodes → projected into Winfield and Azure
- All extensions come locally from Winfield (no internet required)
- Customer logs into **Winfield portal** (not Azure portal) going forward

**Step 5 — Subsequent Cluster Operations:**
- Additional clusters managed via Winfield portal
- Further extensions and workloads deployed from local Winfield hosting
