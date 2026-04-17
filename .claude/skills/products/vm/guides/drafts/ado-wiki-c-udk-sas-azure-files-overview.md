---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/Workflows/UDK SAS for Azure Files/User Delegation SAS for Azure Files Overview_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FWorkflows%2FUDK%20SAS%20for%20Azure%20Files%2FUser%20Delegation%20SAS%20for%20Azure%20Files%20Overview_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# User Delegation SAS for Files Overview

## Introduction

User Delegation SAS (Shared Access Signature) for Azure Files enables secure, time-limited access to files in Azure Storage without relying on storage account keys. This feature is designed for scenarios where clients cannot authenticate with Managed Identity and require delegated, short-lived access to specific files. The private preview is intended for non-production use only, and production SLAs are not currently available.

## Key Concepts

- **User Delegation SAS**: A SAS token tied to the Managed Identity of the entity that generated it, not to storage account keys.
- **Short-lived Access**: Recommended lifetime is less than 1 hour; maximum is 7 days.
- **Revocation**: SAS tokens can be revoked by removing IAM permissions from the delegator.
- **Per-object SAS**: Each file requires its own SAS token, including files that do not yet exist.

## Prerequisites

- **Non-production Storage Account**: Only use accounts without production workloads.
- **Supported Regions**: Central US EUAP, East US2 EUAP (more regions planned).
- **Storage Account Type**: General Purpose v2 (GPV2).
- **Required Roles**:
  - Storage File Data Privileged Contributor
  - Storage File Delegator

## REST API Workflow

### 1. Assign RBAC Roles

Assign the necessary roles to the user who will generate the SAS token:

- **Storage File Data Privileged Contributor**
- **Storage File Delegator**

### 2. Obtain User Delegation Key

Make a POST request to the following endpoint (replace `myaccount` with your storage account name):

    https://myaccount.file.core.windows.net/?restype=service&comp=userdelegationkey

**Required Headers:**

- `Authorization`: Bearer token (OAuth2 from Microsoft Entra)
- `x-ms-version`: Storage API version

**Request Body (XML):**

```xml
<KeyInfo>
  <Start>ISO Date</Start>
  <Expiry>ISO Date</Expiry>
</KeyInfo>
```

- Start and Expiry must be within 7 days of the current date.

### 3. Create User Delegation SAS Token for Files

**Required SAS Token Parameters:**

| SAS Field Name      | Token Parameter | Required | Description                                       |
| ------------------- | --------------- | -------- | ------------------------------------------------- |
| SignedPermissions   | sp              | Yes      | Permissions granted (read, create, write, delete) |
| SignedStart         | st              | Optional | Start time (ISO 8601 UTC)                         |
| SignedExpiry        | se              | Yes      | Expiry time (ISO 8601 UTC, 7 days)               |
| signedObjectId      | skoid           | Yes      | Microsoft Entra security principal                |
| signedTenantId      | sktid           | Yes      | Microsoft Entra tenant                            |
| signedKeyStartTime  | skt             | Optional | Key start time                                    |
| signedKeyExpiryTime | ske             | Yes      | Key expiry time                                   |
| signedKeyService    | sks             | Yes      | Service (f for files)                             |
| signedKeyVersion    | skv             | Yes      | API version                                       |
| SignedIP            | sip             | Optional | IP address/range                                  |
| SignedProtocol      | spr             | Optional | Protocol (HTTPS only)                             |
| SignedVersion       | sv              | Yes      | Storage service version                           |
| SignedResource      | sr              | Yes      | 'f' for file, 's' for share                       |
| Signature           | sig             | Yes      | HMAC-SHA256 signature                             |

**Permissions for Files:**

| Permission | URI Symbol | Allowed Operations                                  |
| ---------- | ---------- | --------------------------------------------------- |
| Read       | r          | Read content, properties, metadata; source for copy |
| Create     | c          | Create new file or copy file                        |
| Write      | w          | Write content, properties, metadata; resize file    |
| Delete     | d          | Delete file                                         |
