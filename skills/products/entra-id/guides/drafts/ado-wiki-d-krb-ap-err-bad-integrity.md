---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AskDS Blog Content/20240112 KRB_AP_ERR_BAD_INTEGRITY"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAskDS%20Blog%20Content%2F20240112%20KRB_AP_ERR_BAD_INTEGRITY"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# KRB_AP_ERR_BAD_INTEGRITY - Troubleshooting Guide

Originally posted on AskDS blog at [KRB_AP_ERR_BAD_INTEGRITY | Microsoft Community Hub](https://techcommunity.microsoft.com/blog/askds/krb-ap-err-bad-integrity/4022504)

## What does KRB_AP_ERR_BAD_INTEGRITY tell us?

KRB_AP_ERR_BAD_INTEGRITY tells us one thing: a failure to decipher a Kerberos referral ticket.

When an account (the client) wants to access resources in another trusting domain, the client must first get a referral ticket (Inter-Realm TGT) from a KDC in its own domain. The client can then present the referral ticket to a KDC in the Trusting Domain.

The referral ticket is enciphered with a secret shared between the two domains. This common secret is stored on the Trusted Domain Object (TDO) in the domain partition of Active Directory. If the receiving KDC cannot decipher the referral ticket using the secret on its copy of the TDO, then the resulting error is KRB_AP_ERR_BAD_INTEGRITY.

## Comparison with KRB_AP_ERR_MODIFIED

KRB_AP_ERR_MODIFIED means the account secret (password hash) used to decipher a ticket cannot decipher it. Common reasons:
- Broken Secure Channel (computer password mismatch)
- SPN on the wrong account
- Misconfigured service (wrong account, clustering, CNAMEs)
- Network packet mangling
- Malicious activity

KRB_AP_ERR_BAD_INTEGRITY is specifically about **referral tickets** between domains/forests.

## Common Symptoms

- Users are being prompted for passwords over and over
- Logon failures
- Trust validation failures
- Active Directory Replication problems, particularly between Global Catalog servers in different domains
- Clearing the client Kerberos cache fixes the problem (perhaps temporarily): `klist purge`

## Diagnostic Steps

### Step 1: Get a network trace from the client

Look for KRB_AP_ERR_BAD_INTEGRITY error in Kerberos traffic. Keep in mind the "client" may be a server-side application (ADFS, IIS, SQL, Exchange).

### Step 2: Check TDO attribute versions with repadmin

Run on a DC in each domain involved:

```cmd
repadmin /showobjmeta * "CN=<trustedDomain>,CN=System,DC=<domain>,DC=<suffix>"
```

Check that `trustAuthIncoming` and `trustAuthOutgoing` versions are consistent across **all DCs within each domain**.

- Different versions **across domains** is normal
- Different versions **within the same domain** indicates a replication issue

### Step 3: Identify root cause

Common causes:
- DCs being replaced, upgraded or moved around
- Authoritative restores from old backups or snapshots
- Network changes (topology, new equipment, security software) breaking replication
- Large complex environments not properly maintained
- TDO passwords auto-change every 30 days; a change 60+ days ago can cause sync issues

### Step 4: Fix the trust

**Option A: Using netdom (recommended)**

On a domain admin in the parent domain:
```cmd
netdom trust contoso.com /domain:child.contoso.com /resetOneSide /passwordT:NewSecret123 /userO:administrator /passwordO:*
```

On a domain admin in the child domain:
```cmd
netdom trust child.contoso.com /domain:contoso.com /resetOneSide /passwordT:NewSecret123 /userO:administrator /passwordO:*
```

> **Important**: Use the same `/passwordT` value on both sides. Run the reset **at least twice**, with time for AD replication between each change, to ensure the version number is higher than any out-of-date DC.

**Option B: Using Domains and Trusts snap-in**

On the PDC in the affected domain, validate the trust and reset the password when prompted.

### Step 5: Clear client Kerberos cache

```cmd
klist purge
```

## Key Lesson

When dealing with trust secret mismatches and DCs being bounced up and down:
- **Change the secret more than once** - it won't hurt anything
- Allow enough time for domain-wide replication between each change
- The DC with the **higher version number** for `trustAuthIncoming`/`trustAuthOutgoing` wins replication
- If versions are equal, the one with the most recent timestamp wins

## References

- [How trust relationships work for forests in Active Directory](https://learn.microsoft.com/en-us/entra/identity/domain-services/concepts-forest-trust)
- [TDO password changes](https://learn.microsoft.com/en-us/entra/identity/domain-services/concepts-forest-trust#tdo-password-changes)
- [AD Forest Recovery - Reset a trust password](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/forest-recovery-guide/ad-forest-recovery-reset-trust)
- [Cross-Domain Trust and Referrals](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kile/bac4dc69-352d-416c-a9f4-730b81ababb3)
- [trustAuthInfo Attributes](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/c964fca9-c50e-426a-9173-5bf3cb720e2e)
- [AD Replication troubleshooting](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/troubleshoot-adreplication-guidance)
