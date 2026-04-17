---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Server Side Encryption (SSE)/Migrate SSE+CMK Encrypted at_Host_Encryption"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FServer%20Side%20Encryption%20(SSE)%2FMigrate%20SSE%2BCMK%20Encrypted%20at_Host_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Migrate SSE+CMK to Encryption at Host

## Environment

Affects all Windows & Linux VMs

## Limitation

- Cannot enable Encryption at Host on VMs that currently or ever had ADE enabled
- ADE cannot be enabled on disks with Encryption at Host enabled
- For ADE to at-Host migration, follow ADE-to-CMK migration steps first

## Scenario

Customer has SSE+CMK encryption and wants to switch to Encryption at Host.

## Verification

Check if disk is part of an Encryption Set:
- ASC > Disks > Expand > Managed Disk > Click disk name > EncryptionType

## Resolution Steps

1. Confirm all VM disks have SSE+CMK enabled
2. **Stop/deallocate the VM**
3. For each disk (OS and data):
   a. Select the disk
   b. Go to **Encryption** tab
   c. Change to **Platform-Managed Key (PMK)** — removes CMK association
   d. **Save**
4. Go back to VM > Disks > **Encryption Settings**
5. Select **Encryption at Host**

**Important:** Repeat disk encryption change for both OS and all data disks before enabling at-host encryption.
