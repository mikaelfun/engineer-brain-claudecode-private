---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MIP SDK/Learn: MIP SDK/Learn: Licensing Redirection"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMIP%20SDK%2FLearn%3A%20MIP%20SDK%2FLearn%3A%20Licensing%20Redirection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Introduction

MSIPC uses registry settings and DNS SRV records for licensing redirection. How does the MIP SDK do the same?

# Premise

Protected content is stamped with the licensing URLs of the service used for the protection. This is how the consuming client knows where to go to request access.

In migration scenarios one must have a way for the client to redirect from the old URL to the new active RMS service. This is the common scenario when migrating from AD RMS to AIP.

# Overview

## AD RMS keys and URLs

### AD RMS Keys
Below is the AD RMS centrally managed key.

### Licensing URLs
Below is the AD RMS licensing URL. In this case there is only the intranet URL. Some customers may have both the intranet and extranet licensing URLs.

## AIP

### Imported AD RMS keys
The AD RMS key was successfully imported into AIP.

## Protected Content

### Publishing License

From an MSIPC *.ipclog file:

```
++++++++ INFORMATION: PL details: ++++++++
          Intranet Licensing Url: "https://irm.moose.local/_wmcs/licensing",
          Extranet Licensing Url: "NULL",
          IssuerName: "AD_RMS_Key"
          Owner: "user1@moose.local",
          ContentId: "{4AD75267-638D-4085-8141-3FCF50BB1C07}",
          Content Valid until: "NULL".
```

# Redirection - the SDK way

The redirection is included in the access attempt.
1. The MIP SDK connects to `https://api.aadrm.com`.
2. The [AD RMS] licensing URL is presented and a lookup is performed.
3. The public key (SLC) used in the protection is provided for the look up.
4. If the protection key is imported into an AADRM tenant the access attempt processing continues.
5. AADRM determines if the requesting user is granted access.

## Example

In this example an AD RMS protected file is being queried with `Get-AIPFileStatus` PowerShell cmdlet.
 - The AD RMS key is imported into AIP.
 - The user running the cmdlet is an AIP service super user.

### MIP SDK log

The flow:
 - The publishing license is read to determine what service was used.
 - An AD RMS licensing URL `https://irm.moose.local/_wmcs/licensing` is found.
 - The default AADRM endpoint `https://api.aadrm.com` is used to request access.
 - Access is granted.

The request appears as the following in the log:
```
Sending HTTP request: ID: 2c56ef74-..., Type: POST, Url: https://api.aadrm.com/my/v2/enduserlicenses, ...
```

Since the requesting user is a super user they get full access (HTTP 200).

### Kusto

The lookup/redirection part in Kusto:
- The AD RMS (non-Azure) licensing URL is presented.
- The publishing license (the SLC) is used in the lookup.
- The key is found in an AADRM tenant.
- The AADRM licensing URL is used for the access transaction.

# Redirection - Legacy

MIP SDK clients (including M365 Office) use the previous mechanism.

Legacy applications used MSIPC (instead of MIP SDK). MSIPC used registry settings to manage licensing redirection.

## Redirection registry settings

```
HKLM\SOFTWARE\Microsoft\MSIPC\ServiceLocation\LicensingRedirection
Name:  https://<OnPremRMS>/_wmcs/licensing
Type:  REG_SZ
Value: https://<CloudRMS>/_wmcs/licensing

HKLM\SOFTWARE\Wow6432Node\Microsoft\MSIPC\ServiceLocation\LicensingRedirection
Name:  https://<OnPremRMS>/_wmcs/licensing
Type:  REG_SZ
Value: https://<CloudRMS>/_wmcs/licensing
```
