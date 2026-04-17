# Cross-Cloud Labeling Configuration and Limitations

> Source: OneNote - cross-cloud labeling
> Status: draft

## Overview

Cross-cloud labeling allows users in one cloud (e.g., Gallatin/21V) to consume sensitivity-labeled content from another cloud (e.g., Global). Currently in **Public Preview**.

## Configuration Requirements

### 1. Cross-Tenant Access Policy (XTAP) - Both Sides

- Must configure bidirectional XTAP between both tenants
- If XTAP is configured bidirectionally: external users can access protected resources even without B2B Guest/Member invitation
- If XTAP is NOT configured: access to protected documents will **fail**

### 2. Label Encryption Permissions

Purview admins must explicitly include external user's identity in label permissions:
- By email domain: `*@partnerdomain.com`
- By specific user: `user@partnerdomain.com`

Without these permissions, even with XTAP in place, content consumption will fail.

### 3. Email Address Requirement

Users opening encrypted files must have an email address assigned in their directory.

## Supported Content Types

| Type | Supported |
|------|-----------|
| Word files (offline) | Yes |
| Excel files (offline) | Yes |
| PowerPoint files (offline) | Yes |
| Email (all Outlook clients) | **No** |

## Limitations

1. Only **offline** encrypted Word, Excel, and PowerPoint files are supported
2. **Email is NOT supported** - includes all Outlook clients (desktop, web, mobile)
3. Public Preview - behavior may change

## Reference

- [Microsoft Entra configuration for encrypted content](https://learn.microsoft.com/en-us/purview/encryption-azure-ad-configuration?view=o365-worldwide#cross-cloud-access-settings-and-encrypted-content)
- [MIP parity for 21Vianet](https://learn.microsoft.com/en-us/azure/information-protection/parity-between-azure-information-protection)
- PM contact: **Guang Yang** (doc logic and 21V-specific updates)
