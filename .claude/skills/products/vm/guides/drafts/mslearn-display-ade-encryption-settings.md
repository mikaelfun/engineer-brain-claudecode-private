---
title: How to Display Azure Disk Encryption Settings via Resource Explorer
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/how-to-display-encryption-settings-with-azure-resource-explorer
product: vm
tags: [ADE, encryption, Resource-Explorer, single-pass, dual-pass, KeyVault]
21vApplicable: true
---

# How to Display Azure Disk Encryption Settings

## Overview
When Azure Disk Encryption (ADE) is enabled on a Linux VM, encryption settings are configured at a platform level. This guide shows how to visualize these settings.

## Identify ADE Extension Version
- Open VM properties > Extensions > AzureDiskEncryptionForLinux
- Version 0.* = dual-pass encryption (settings on VM object)
- Version 1.*+ = single-pass encryption (settings on disk object)
- Recommendation: Use single-pass (current version, no Entra ID dependency)

## View via Azure Portal Resource Explorer
1. Search "resource explorer" in Azure portal search bar
2. Navigate to subscription > resource group > disk
3. Look for encryptionSettingsCollection in the JSON metadata:
   - enabled: true = encryption settings stamped
   - sourceVault = key vault URL
   - secretUrl = encryption secret URL
   - keyEncryptionKey (optional) = KEK wrapping key URL
   - encryptionSettingsVersion: 0.* = dual-pass, 1.* = single-pass

## Key Fields
| Field | Description |
|-------|-------------|
| encryptionSettingsCollection.enabled | Whether disk has encryption settings |
| sourceVault.id | Full path to the Key Vault |
| secretUrl | Full URL of the generated secret |
| keyEncryptionKey.keyUrl | URL of the KEK (optional) |
| encryptionSettingsVersion | 0.* = dual-pass, 1.* = single-pass |
