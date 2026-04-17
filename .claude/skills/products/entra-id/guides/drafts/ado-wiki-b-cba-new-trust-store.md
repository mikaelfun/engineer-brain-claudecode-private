---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Cert Based Auth/CBA: New Trust Store"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Cert%20Based%20Auth/CBA%3A%20New%20Trust%20Store"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# CBA: New Trust Store

## Feature Overview

Certificate-based authentication (CBA) in Entra ID allows organizations to configure their tenants for phishing-resistant application and browser authentication using X.509 certificates from their Enterprise Public Key Infrastructure (PKI).

Until now, Entra ID supported a maximum of 32 Certificate Authorities (CAs), each up to 2KB in size, with a total storage limit of 64KB. This flat list of CAs didn't allow organizations with multiple PKI structures to separate different groups of CAs.

The new Certificate Authority (CA) Trust Store for CBA offers:

- Up to 250 CAs per container, each up to 8KB in size (Commercial and US Government clouds), with potential expansion to 512+ CAs
- Up to 50 Public Key Infrastructure (PKI) containers for segmenting PKI environments
- Upload individual CA public keys or entire PKI chain from P7B/PEM files
- Soft-deleted PKI containers and CAs restorable for up to 30 days

## Required Roles

- Global Administrator
- Privileged Authentication Administrator
- Authentication Policy Administrator
- Custom roles using RBACv2 actions

### RBACv2 Actions

| Action Url | Operation |
|---|---|
| microsoft.directory/publicKeyInfrastructure/basic/read | Read basic properties of PKI entities |
| microsoft.directory/publicKeyInfrastructure/basic/create | Create PKI entity |
| microsoft.directory/publicKeyInfrastructure/basic/update | Update properties on PKI |
| microsoft.directory/publicKeyInfrastructure/basic/delete | Delete PKI entity |
| microsoft.directory/publicKeyInfrastructure/certificateAuthorities/basic/read | Read basic properties of CAs |
| microsoft.directory/publicKeyInfrastructure/certificateAuthorities/create | Add CA into PKI |
| microsoft.directory/publicKeyInfrastructure/certificateAuthorities/update | Update CA |
| microsoft.directory/publicKeyInfrastructure/certificateAuthorities/delete | Delete CA |

## Known Issues

### Issue 0: AuthN is not blocked for a revoked cert

When the old Certificate Authority store has no CA certificate in it, and all CAs are only in new store, authentication is not blocked for a revoked certificate.

**Workaround**: Upload a certificate (even a dummy certificate) to the old certificate store. As long as the old store does not return null, revocation checking will be enforced. Fix pending rollout.

### Issue 1: Deleted CAs are not Scoped to their PKI Container

During public preview, clicking Deleted CAs under a PKI container shows all deleted CAs across all containers. Will be fixed by GA with parent association property.

### Issue 2: Ten minute CBA authentication delay

~10 minute propagation delay after CA CRUD operations. Typically ~3 minutes. Only affects users with certs from the modified CA.

Scenarios:
1. Admin uploads CAs to new store while they still exist in old store with Issuer Hints enabled → no delay for existing CAs
2. Admin rolls an expired CA (delete old, upload new) → no impact if CA subject name remains the same
3. Admin adds new CA → users with certs from new CA must wait for cache propagation
4. Admin deletes CA → deleted CA remains in hints cache until propagation completes; users presenting cert from deleted CA will fail

### Issue 3: Hard Deletion of PKI container fails

During public preview, permanently deleting a soft-deleted PKI container before 30-day period fails with 400 Bad Request. Will be supported by GA.

## Behavior of CAs Coexisting in Old and New Store

ESTS honors both old and new stores. ESTS gets CAs from both and walks up the chain. If both stores have the same CA, no issue. However, if CA1 exists in both stores with different CRL values, ESTS cannot guarantee which one will be used (library uses non-deterministic parent chain walking).

## Managing PKI Containers

### Portal

Navigate to **Protection** > **Security Center** > **Public key infrastructure**.

- **Create PKI**: Click Create PKI, enter display name, click Create
- **Edit PKI**: Click ellipses (...) > Edit name
- **Soft-Delete PKI**: Check box > Delete > confirm by typing PKI name
- **Restore PKI**: Deleted PKI tab > check box > Restore PKI > Ok
- **Permanently Delete**: Deleted PKI tab > check box > Delete permanently

### API (Microsoft Graph)

- **Create**: `POST https://graph.microsoft.com/beta/directory/publicKeyInfrastructure/certificateBasedAuthConfigurations` with `{"displayName": "name"}`
- **List All**: `GET https://graph.microsoft.com/beta/directory/publicKeyInfrastructure/certificateBasedAuthConfigurations`
- **Get**: `GET .../certificateBasedAuthConfigurations/<container_id>`
- **Update**: `PATCH .../certificateBasedAuthConfigurations/<container_id>` with `{"displayName": "new name"}`
- **Soft Delete**: `DELETE .../certificateBasedAuthConfigurations/<container_id>`
- **Restore**: `POST /directory/deletedItems/<container_id>/restore`
- **Hard Delete**: `DELETE https://graph.microsoft.com/beta/directory/deletedItems/<container_id>`

### Permissions

| ScopeName | Type |
|---|---|
| PublicKeyInfrastructure.Read.All | Delegated (Admin consent required) |
| PublicKeyInfrastructure.ReadWrite.All | Delegated (Admin consent required) |

## Managing Certificate Authorities

### Upload PKI Chain (Portal)

Supports uploading .PEM or .P7B files from SharePoint Online or Azure Storage.

### Upload Individual CA (Portal)

Click Add certificate authority > Browse .CER file > select root/intermediate > enter CRL URL > Save.

### API Operations

- **Create CA**: `POST .../certificateBasedAuthConfigurations/<container_id>` with Base64-encoded certificate
  - Root CAs must be uploaded as "intermediate" first, then updated to "root" via PATCH
- **List CAs**: `GET .../certificateBasedAuthConfigurations/<container_id>/certificateAuthorities`
- **Get CA**: `GET .../<container_id>/certificateAuthorities/<CA_id>`
- **Update CA**: `PATCH .../<container_id>/certificateAuthorities/<CA_id>`

### CA Object Properties

| Property | Type | Description |
|---|---|---|
| id | string | CA entity ID |
| certificateAuthorityType | enum | "root" or "intermediate" |
| certificate | binary | CA public key |
| issuer | string | CA name |
| thumbprint | string | CA public cert thumbprint |
| certificateRevocationListUrl | string | CRL URL |
| deltaCertificateRevocationListUrl | string | Delta CRL URL |
| isIssuerHintEnabled | bool | If true, CA is shown in cert picker |

## Get .CER Base64 Format

```powershell
$rootca = [System.Security.Cryptography.X509Certificates.X509Certificate2]("C:\temp\CAs\LatestRoot.cer")
$MyRootCA = [system.convert]::tobase64string($rootca.rawdata)
$MyRootCA | Set-Clipboard
```

## API Error Codes

| Status Code | Message | Reason |
|---|---|---|
| 400 | PKI has certificate authorities associated | Delete failure if PKI has CAs |
| 400 | Need URL to upload Certificate Authorities | Upload CAs without passing file/URL |
| 400 | Cannot delete a PKI that has CAs being uploaded | Deleting PKI during upload |
| 400 | Cannot upload when another operation is in progress | Concurrent upload |
| 200 (failed) | PKI file size greater than 256MB | File too large |
| 200 (failed) | Transient error uploading PKI file | Internal service outage |

## Public Documents

- [certificateBasedAuthPki resource type](https://microsoft.com/en-us/graph/api/resources/certificatebasedauthpki)
- [certificateAuthorityDetail resource type](https://learn.microsoft.com/en-us/graph/api/resources/certificateauthoritydetail?view=graph-rest-beta)
