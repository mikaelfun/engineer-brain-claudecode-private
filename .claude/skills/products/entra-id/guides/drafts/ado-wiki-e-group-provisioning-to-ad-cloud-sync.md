---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Cloud Sync/EntraID to AD/Group Provisioning to AD using Cloud Sync"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Sync%20Provisioning/Cloud%20Sync/EntraID%20to%20AD/Group%20Provisioning%20to%20AD%20using%20Cloud%20Sync"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Sync
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   


[[_TOC_]]


# Compliance note
This wiki contains test and/or lab data only.


# Feature overview

Cloud sync security group provisioning provides the capability to synchronize cloud security groups to AD. These groups are managed in the cloud and can be used to control access to on-premises applications and resources.

An on-premises application relies on AD security group membership to authenticate users. By maintaining users in a cloud security group, writing this group back to on-premises, and tying the application to use this ?written back? security group, the customer can apply Entra governance capabilities like Access Reviews, Access Packages, and Lifecycle Workflows to this cloud security group ? and by extension, the customer has now brought this on-premises application into cloud-based governance.

## Supported scenarios:

- Cloud created security group to AD security group with Universal scope
    -   Note: Will not support Global or Domain local scope
- Assigned and dynamic group membership
- On-premises synchronized user membership (same domain and cross domain same forest)
    - On-premises users synchronized using Cloud Sync and AAD Connect
- Cloud created nested security group membership (same domain)
    - Note: Only support nested SGs written back to same domain?




# Case handling

This feature is supported by Sync-Provisioning: azidcomm-prov@microsoft.com



# Licensing

Using this feature requires Microsoft Entra ID P1 licenses. 

# Requirements

- Microsoft Entra account with at least a Hybrid Identity Administrator role.
- On-premises Active Directory Domain Services environment with Windows Server 2016 operating system or later.
- Required for AD Schema attribute - msDS-ExternalDirectoryObjectId
- Provisioning agent with build version 1.1.1370.0 or later.
- The provisioning agent must be able to communicate with one or more domain controllers on ports TCP/389 (LDAP) and TCP/3268 (Global Catalog). This is required for global catalog lookup to filter out invalid membership references
- Microsoft Entra Connect with build version 2.2.8.0 or later
  - Required to support on-premises user membership synchronized using Microsoft Entra Connect
  - Required to synchronize AD:user:objectGUID to AAD:user:onPremisesObjectIdentifier


# Limitations and known issues




# How to configure and manage

## Prerequisites

- Account with [Hybrid Identity Administrator](https://learn.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#hybrid-identity-administrator) (or Global Administrator) role.
- On-premises Active Directory Domain Services environment with Windows Server 2016 operating system or later.
    - Required for AD schema attribute msDS-ExternalDirectoryObjectId
- Provisioning agent with build version 1.1.1366.0 or later.
- The provisioning agent must be able to communicate with the domain controller(s) on ports TCP/389 (LDAP) and TCP/3268 (Global Catalog).
    - Required for global catalog lookup to filter out invalid membership references.
    - Note: Does not support ports TCP/636 (LDAPS/LDAP over SSL) and TCP/3269 (GC over SSL).
- (optional) AAD Connect with build version 2.2.8.0 or later.
    - Required to support on-premises user membership synchronized using AAD Connect.
    - Required to synchronize AD:user:objectGUID to AAD:user:onPremisesObjectIdentifier

## Install the agent
- Download the provisioning agent from the portal.
- Install the provisioning agent with the Cloud Sync extension enabled.
- Connect to the cloud (AAD or Entra ID) using the account with Hybrid Identity Administrator (or Global Administrator) role.
- Configure the service account to manage synchronization on-premises.
- Connect to the AD domain(s) using Domain (or Enterprise) Administrator account to register the domain in the cloud.

## Permissions for on-premises service account

- Read, Write, Create, Delete all properties for all descendent Group and User objects.

- Note: These permissions are NOT applied to AdminSDHolder objects by default.

## Domain configuration

- Multiple domain configurations are supported.
- Group(s) can be provisioned to multiple domains.

   ![Picture1](/.attachments/AAD-Synchronization/1199571/Picture1.png)

## Group scope

- All security groups
- Selected security groups (default)
    - Uses app role assignments for granting entitlement.
    - Selected group(s) and its direct members are entitled (in scope).

  ![Picture2](/.attachments/AAD-Synchronization/1199571/Picture2.png)

## Target container

- Target AD attribute mapping **?parentDistinguishedName?** is used to specify the target container.
- Multiple target containers can be configured using an attribute mapping expression with the **Switch()** function.

  ![Picture3](/.attachments/AAD-Synchronization/1199571/Picture3.png)

## Attribute scope filter

Attribute based scope filtering is supported.

  ![Picture4](/.attachments/AAD-Synchronization/1199571/Picture4.png)

## Attribute mapping

- Attribute mapping is supported.
- Schema (directory extensions and AD schema attributes) discovery will be supported.

  ![Picture5](/.attachments/AAD-Synchronization/1199571/Picture5.png)

## Default attribute mapping

| **Target  attribute**          | **Source  attribute**                                        | **Mapping  type** | **Notes**                                                    |
| ------------------------------ | ------------------------------------------------------------ | ----------------- | ------------------------------------------------------------ |
| adminDescription               | Append("Group_", [objectId])                                 | Expression        | CANNOT UPDATE IN UI / SHOULD NOT  UPDATE  Used for filtering out AD to  cloud sync |
| cn                             | Append(Append(Left(  Trim([displayName]),  51), "_"),  Mid([objectId],  25, 12)) | Expression        |                                                              |
| description                    | Left(Trim([description]), 448)                               | Expression        |                                                              |
| displayName                    | displayName                                                  | Direct            |                                                              |
| isSecurityGroup                | True                                                         | Constant          | CANNOT UPDATE IN UI / SHOULD NOT  UPDATE                     |
| member                         | members                                                      | Direct            | CANNOT UPDATE IN UI / SHOULD NOT  UPDATE                     |
| msDS-ExternalDirectoryObjectId | Append("Group_", [objectId])                                 | Expression        | CANNOT UPDATE IN UI / SHOULD NOT  UPDATE  Used for joining / matching in AD |
| objectGUID                     |                                                              |                   | CANNOT UPDATE IN UI / SHOULD NOT  UPDATE  Read only ? anchor in AD |
| parentDistinguishedName        | OU=Users,DC=contoso,DC=com                                   | Constant          | Default in the UI                                            |
| universalScope                 | True                                                         | Constant          | CANNOT UPDATE IN UI / SHOULD NOT  UPDATE                     |

## Accidental deletion prevention

- Accidental deletes prevention is supported and can be configured.
- By default, it is enabled with the deletion threshold 500.
- Learn more: [accidental deletes prevention](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/cloud-sync/how-to-accidental-deletes)

  ![Picture6](/.attachments/AAD-Synchronization/1199571/Picture6.png)

## Provision on demand

- Troubleshoot configuration issues quickly.
- Validate expressions that you've defined.
- Test scoping filters.
- Note: Only supports up to five members at a time.
- Learn more: [Provision on demand](https://learn.microsoft.com/en-us/azure/active-directory/app-provisioning/provision-on-demand?pivots=app-provisioning)

  ![Picture7](/.attachments/AAD-Synchronization/1199571/Picture7.png)

## Configuration status

Shows the status at the domain configuration (or job) level.

  ![Picture8](/.attachments/AAD-Synchronization/1199571/Picture8.png)

## Provisioning logs

- Shows the status at the object level.
- Expect 5 to 10-minute delay between processing the object and writing to the provisioning logs.

![Picture9](/.attachments/AAD-Synchronization/1199571/Picture9.png)

## Synchronization Steps

This is the workflow for group sync:

- Import from cloud
- Determine object is entitled ? ?Group scope?
- Determine object is in scope ? ?Attribute scope filter?
- Try to match object between cloud and on-premises
    - Reference resolution ? global catalog lookup to filter out invalid membership references
- Evaluate attribute mapping
- Export to on-premises AD

# Troubleshooting

## Communication issues with AD (blocked ports)
If you are having communication issues with Active Directory Domain Controllers and suspect blocked ports use [PortQryUI.exe](https://www.microsoft.com/en-us/download/details.aspx?id=24009) on the machine hosting the agent and select Domains and Trusts to verify TCP/389 (LDAP) and TCP/3268 (Global Catalog) are listening. 

## New cloud configuration cannot be created

**Issue:** Domain not found in the new configuration dropdown or dropdown is disabled.

**Possible causes:**

- Domain is already configured.
- On-premises agent is not installed.
- On-premises agent is not setup with the **Cloud Sync extension** enabled.

**Resolution:**
- Ensure domain is not configured.
- Ensure agent is installed.
- Ensure agent is setup with the Cloud Sync extension enabled.
- Ensure agent service is running and active.

![Picture10](/.attachments/AAD-Synchronization/1199571/Picture10.png)

![Picture11](/.attachments/AAD-Synchronization/1199571/Picture11.png)

## Cloud configuration cannot be enabled

**Issue:** ?Review and enable? button is disabled.

**Possible causes:**

- Scope filters is not configured.
- Target container is not configured.
- If Group scope ? Selected security groups is configured, no groups are selected.

**Resolution:**

- Ensure target container (parentDistinguishedName) attribute mapping is configured.
- Ensure at least one group is selected, if Group scope ? Selected security groups is configured.


  ![Picture12](/.attachments/AAD-Synchronization/1199571/Picture12.png)

## Objects and/or membership are not provisioning to AD without errors

**Possible causes:**

- Cloud configuration is disabled.
- Job not yet run after the changes.
- Group is not a cloud created security group.
- Group is not entitled ? Group scope.
- Group is not in scope ? Attribute scope filter.
- On-premises synchronized user?s onPremisesObjectIdentifier attribute is not initialized.

**Resolution:**

- Ensure cloud configuration is enabled.
- The sync schedule interval is 20 minutes (best case scenario ~10 minutes because of job execution in failover datacenter pair). Please check the ?last successful run? in configuration status.
- Ensure group is a cloud created security group.
- Ensure group is selected if Group scope is Selected security groups.
    - Check provisioning logs for details.
- Group is in scope if Attribute scope filter is configured.
    - Check provisioning logs  for details.
- Ensure user is synchronized from on-premises using Cloud Sync or AAD Connect with build version 2.2.8.0 or later recently

## Objects and / or membership are not provisioning to AD with errors

Errors at the domain configuration (or job) level shown in the configuration status.



| **Error  codes**                                             | **Possible  causes**                                         | **Resolution**                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ?HybridIdentityServiceNoActiveAgents  ?HybridIdentityServiceAgentTimeout  ?HybridSynchronizationTimeoutError | Agent(s) not active or reachable  or busy.                   | Ensure agent is running and  active.  Check on-premises server network  configuration (firewall and proxy) and performance (CPU, memory, and disk). |
| ?HybridSynchronization     InvalidResponse                   | If details contains ?Unsupported  modification types: Add?, then the agent build does not support provisioning  to AD. | Ensure agent build version is  1.1.1366.0 or later that supports provisioning to AD. |
| ?SchemaInvalid                                               | The attribute mapping for ?group?  object type in the TargetDirectory  schema is missing for parentDistinguishedName. | Ensure target container attribute  mapping is configured.    |
| ?HybridSynchronization     UnableToFindDomainController  ?HybridSynchronizationActiveDirectory     LdapBindOperationFailed | Unable to reach the domain  controller.  Ldap  bind operation failed during an attempt to establish a ldap  connection with the domain controller. | Ensure the service account in the on-premises server can  communicate with the domain controller on port TCP/389 (LDAP). |
| ?HybridSynchronizationActiveDirector     UnableToFindGlobalCatalog  ?HybridSynchronizationActiveDirectory     LdapBindToGlobalCatalogFailed | Unable to reach a global catalog.  Ldap  bind operation failed during an attempt to establish a ldap  connection with the global catalog | Ensure the service account in the on-premises server can  communicate with the global catalog on port TCP/3268 (Global Catalog). |
| ?HybridSynchronizationActiveDirectory     InsufficientAccessRights | Insufficient access rights to  perform the operation.        | Ensure the service account has  the required permissions.     Refer: Set-AADCloudSyncPermissions -PermissionType UserGroupCreateDelete |
| ?HybridSynchronizationActiveDirectory     DistinguishedNameBadSyntax | The object distinguished name has  bad syntax.               | Ensure the target attribute  mappings for ?cn?  and ?parentDistinguishedName?  are valid and has the right syntax. |
| ?HybridSynchronizationActiveDirectory     ObjectNameAlreadyExists | An attempt was made to add an  object to the directory with a name that is already in use. | Ensure the target attribute  mappings for ?cn?  and ?parentDistinguishedName?  are valid and generates a unique distinguished name in the domain. |
| ?DuplicateTargetEntries                                      | Multiple target entries were  found and for the same source entry, so joining failed. | Ensure exactly one entry exists  in the domain with the joining property ?msDS-ExternalDirectoryObjectId?  value. |
| ?HybridSynchronizationActiveDirectory     DirectoryObjectNotFound  ?HybridSynchronizationActiveDirectory     InexistentAccount  ?ExternalError (NoSuchObject) | The object does not exist.  Directory object not found.  The specified account does not  exist. | Ensure the object in AD exists  and is not deleted. Can use provision on demand to fix this issue. |


## ICM escalations

**Service:** AAD SyncFabric

**Team:** CloudSync - ADToAAD


# Supportability documentation



## External documentation

[Microsoft Entra Connect cloud provisioning agent: Version release history](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/cloud-sync/reference-version-history?branch=pr-en-us-251656#1113670)

[Provisioning Microsoft Entra ID to Active Directory using Microsoft Entra Cloud Sync](https://learn.microsoft.com/en-us/entra/identity/hybrid/cloud-sync/how-to-configure-entra-to-active-directory)

[Govern on-premises Active Directory(Kerberos) application access with groups from the cloud](https://learn.microsoft.com/en-us/entra/identity/hybrid/cloud-sync/govern-on-premises-groups)

## Training sessions and deep dives

Deep dive: https://aka.ms/AAmv4yl
