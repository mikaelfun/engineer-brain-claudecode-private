# AVD W365 Government (GCC/GCCH) - Comprehensive Troubleshooting Guide

**Entries**: 11 | **Drafts fused**: 8 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-downgrade-from-gcc-to-fedramp.md, ado-wiki-government-support-guidelines.md, ado-wiki-restricted-region-exception.md, ado-wiki-set-up-pme-account.md, ado-wiki-w365-enterprise-for-gcc.md, ado-wiki-w365-gov-saw-gcch-setup.md, ado-wiki-w365-government-identify-tenant-type.md, ado-wiki-w365-government-offerings.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: OneNote, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Cannot enroll AVD session hosts to Microsoft Intune in Azure... | Microsoft Intune management for AVD session hosts is only su... | No officially supported method in Mooncake. Unsupported work... |
| Cannot purchase or activate W365 FedRAMP licenses after remo... | Mutual exclusivity of GCC and FedRAMP offerings at tenant le... | Wait 72+ hours after GCC license deletion. Verify GCC licens... |
| GCCH government customers using web clients (especially Safa... | microsoft.us cookies are treated as third-party cookies in w... | Work with administrator to unblock 3rd party cookies for mic... |
| Windows 365 Government Cloud PCs cannot be configured on Mic... | Dev Box is an unsupported environment for Windows 365 Govern... | Dev Box is not supported for Government Cloud PCs. This is d... |
| W365 Enterprise for GCC customers see Autopatch/Additional S... | Autopatch/MMD only supports commercial licenses and tenants;... | Select 'None' for Additional Services option to continue cre... |
| Logs too large for ICM attachment limit when working with Go... | ICM has attachment size limits; PG does not have DFM access | Add PG/Dev directly to DTM workspace and share DTM URL in IC... |
| GCC customer reports loss of access to Windows 365 Portal (I... | Windows 365 Portal deprecated for GCC, GCC support now built... | Expected planned deprecation. Use Windows App instead. No mi... |
| Customer requests Windows 365 Cloud PC provisioning in Brazi... | Brazil South is a restricted region for Windows 365; provisi... | Direct customer to their Microsoft Account Team for approval... |

### Phase 2: Detailed Investigation

#### The Considerations
> Source: [ado-wiki-downgrade-from-gcc-to-fedramp.md](guides/drafts/ado-wiki-downgrade-from-gcc-to-fedramp.md)

An existing Windows 365 Government for GCC customer who chooses to transition to Windows 365 Enterprise for FedRAMP will need to make several decisions prior to making the transitions as it will affec

*Contains 3 KQL query template(s)*

#### Government Support Rules
> Source: [ado-wiki-government-support-guidelines.md](guides/drafts/ado-wiki-government-support-guidelines.md)

- Until further notice Windows 10 only. No Upgrade path.

#### Restricted Region Exception
> Source: [ado-wiki-restricted-region-exception.md](guides/drafts/ado-wiki-restricted-region-exception.md)

For W365 Enterprise or Frontline customers requesting provisioning in a restricted region (e.g., US West 2):

#### Request PME Account
> Source: [ado-wiki-set-up-pme-account.md](guides/drafts/ado-wiki-set-up-pme-account.md)

1. Access your SAW using your CORP credentials

#### Windows 365 Enterprise for GCC Customers
> Source: [ado-wiki-w365-enterprise-for-gcc.md](guides/drafts/ado-wiki-w365-enterprise-for-gcc.md)

Windows 365 Enterprise is FedRAMP compliant and can now be purchased by customers with an existing GCC tenant. Previously, GCC tenants could only buy Windows 365 Government SKUs.

#### Secure Access Workstation (SAW) for GCCH Troubleshooting
> Source: [ado-wiki-w365-gov-saw-gcch-setup.md](guides/drafts/ado-wiki-w365-gov-saw-gcch-setup.md)

**IF YOU HAVE NOT BEEN INFORMED BY YOUR MANAGER THAT YOU ARE JOINING THE GCCH TEAM, DO NOT COMPLETE ANY ACTIONS IN THIS DOCUMENT.**

#### Identify Windows 365 Government Tenant Type
> Source: [ado-wiki-w365-government-identify-tenant-type.md](guides/drafts/ado-wiki-w365-government-identify-tenant-type.md)

Access with your `microsoftsupport.com` account:

#### Windows 365 Government Offerings Overview
> Source: [ado-wiki-w365-government-offerings.md](guides/drafts/ado-wiki-w365-government-offerings.md)

### Windows 365 Enterprise (GCC FedRAMP)

### Key KQL Queries

**Query 1:**
```kql
CloudPCEvent
| where env_time >= ago(30d)
| where ServiceName =="AADSyncDaemonFunction"
| where AccountId =="<TenantId>"
| where EventUniqueName =="TryParseOrganization" or EventUniqueName == "TryParseSubscribedPlan" or EventUniqueName == "ParseDirectoryContext"
| project env_time, env_cloud_environment, env_cloud_name, ApplicationName, ComponentName, EventUniqueName, Col1, Col2 , Col3 , Col4, Message,ActivityId, AccountId,ContextId , UserId, PayLoadId
```

**Query 2:**
```kql
CloudPCEvent
| where env_time >= ago(30d)
| where ApplicationName == "tn"
| where EventUniqueName == "PublishEventAsync"
| where Col1 == "Event publish succeed: Tenant.Onboard"
| where AccountId == "<TenantId>"
| project env_time, env_cloud_name, AccountId, Col1
```

**Query 3:**
```kql
CloudPCEvent
| where env_time >= ago(30d)
| where ApplicationName == "LocationServiceFunction"
| where Col1 == "Tenant is soft deleted successfully."
| where AccountId == "<TenantId>"
| project env_time, env_cloud_name, AccountId, Col1
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Cannot enroll AVD session hosts to Microsoft Intune in Azure Mooncake (China). I... | Microsoft Intune management for AVD session hosts is only supported in Azure Pub... | No officially supported method in Mooncake. Unsupported workaround: manually dis... | 🟢 8.5 | OneNote |
| 2 | Cannot purchase or activate W365 FedRAMP licenses after removing GCC licenses; C... | Mutual exclusivity of GCC and FedRAMP offerings at tenant level; Commerce system... | Wait 72+ hours after GCC license deletion. Verify GCC licenses fully removed. Pu... | 🔵 7.5 | ADO Wiki |
| 3 | GCCH government customers using web clients (especially Safari) cannot connect t... | microsoft.us cookies are treated as third-party cookies in web browsers. Safari ... | Work with administrator to unblock 3rd party cookies for microsoft.us domain at ... | 🔵 6.0 | ADO Wiki |
| 4 | Windows 365 Government Cloud PCs cannot be configured on Microsoft Dev Box | Dev Box is an unsupported environment for Windows 365 Government offerings | Dev Box is not supported for Government Cloud PCs. This is documented at https:/... | 🔵 6.0 | ADO Wiki |
| 5 | W365 Enterprise for GCC customers see Autopatch/Additional Services UX in provis... | Autopatch/MMD only supports commercial licenses and tenants; not applicable for ... | Select 'None' for Additional Services option to continue creating the provisioni... | 🔵 6.0 | ADO Wiki |
| 6 | Logs too large for ICM attachment limit when working with Government Cloud PCs; ... | ICM has attachment size limits; PG does not have DFM access | Add PG/Dev directly to DTM workspace and share DTM URL in ICM. See guides/drafts... | 🔵 6.0 | ADO Wiki |
| 7 | GCC customer reports loss of access to Windows 365 Portal (IWP) | Windows 365 Portal deprecated for GCC, GCC support now built into Windows App | Expected planned deprecation. Use Windows App instead. No migration required. | 🔵 6.0 | ADO Wiki |
| 8 | Customer requests Windows 365 Cloud PC provisioning in Brazil South region but r... | Brazil South is a restricted region for Windows 365; provisioning requires Busin... | Direct customer to their Microsoft Account Team for approval process. If custome... | 🔵 6.0 | ADO Wiki |
| 9 | Windows 365 customer wants to deploy Cloud PCs in a restricted region (e.g., US ... | Certain regions are restricted for Windows 365 provisioning; MHN deployments are... | Option 1 (ANC/BYON): If customer has existing resources in the restricted region... | 🔵 6.0 | ADO Wiki |
| 10 | Windows 365 provisioning fails in West Europe with error: Please use only suppor... | West Europe data center capacity restrictions due to physical space limitations ... | 1) New customers: MHN policy hides WEU region; ANC referencing WEU shows Unsuppo... | 🔵 6.0 | ADO Wiki |
| 11 | Unable to get federation from any specified endpoint when connecting to GCCH Kus... | Missing PME account setup, YubiKey not configured, Windows Hello not set up, or ... | Ensure: 1) PME account with YubiKey configured, 2) Windows Hello set up on physi... | 🔵 6.0 | ADO Wiki |
