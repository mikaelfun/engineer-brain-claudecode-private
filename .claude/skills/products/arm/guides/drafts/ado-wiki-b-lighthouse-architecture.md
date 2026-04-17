---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Lighthouse/Architecture/Service overview"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Lighthouse%2FArchitecture%2FService%20overview"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Introduction

When creating a role assignment in ARM, part of the validations made is that the security principal the access is being granted to, lives in the same directory as the scope the role assignment is being created against.

Through Azure Lighthouse functionality, users can create a cross tenant role assignment, where the scope of the role assignment belongs to one directory but the security principal belongs to another directory.

The advantage of allowing this kind of setup, is that these users that are delegated access, now do not need to have an user account in the delegated tenant. They can manage these delegated resources with the same account they would use in their home tenant.

## Resource architecture

On-boarding to Lighthouse require users to set up two resources on the scope that will be delegated (managed by the external security principal).

- **A registration definition (Microsoft.ManagedServices/registrationDefinitions)**: This resource includes all the configuration for the Lighthouse delegation, including the tenant the access is being granted to, the level of access being granted and the security principal ids of the external tenant that will have access via the delegation. This resource also includes information about eligible authorizations (since Azure Lighthouse can leverage PIM functionality. See [[LEARN] Create eligible authorizations](https://learn.microsoft.com/en-us/azure/lighthouse/how-to/create-eligible-authorizations) and offer information (When the Lighthouse offer is published to the Azure marketplace). It is important to note that the creation of the registration definition does not grant any access to any user, it is just the blueprint of the delegation that will be applied on a later step.
- **A registration assignment (Microsoft.ManagedServices/registrationAssignments)**: Once the registration definition is created, it needs to be assigned (applied) to the scope that the user wishes to delegate, which is done by creating a registration assignment. The scope at which the registration assignment is created, is the scope that will be delegated. The registration assignment references the registration definition resource id, to determine what configuration should be applied on the delegation.

  > Creating the registration assignment grants the access to the external security principal. Removing the registration assignment revokes this access.

> At this time, only subscription and resource groups can be delegated access through Azure Lighthouse.

## What happens behind the scenes?

### During on-boarding

> These steps are done internally in Azure by the Microsoft.ManagedServices resource provider (Azure Lighthouse service).

- The subscription where the registration assignment is created, is added the external tenant id (the tenant id in the registration definition, also known as the **managing tenant id**) to the `managedByTenantIds` property
  - This property is updated on the subscription, even if the delegated scope is a resource group.
  - ARM uses this property to determine if cross tenant calls should be authorized to principals from those tenant ids when validating RBAC permissions.
- RBAC role assignments are created for the security principal ids declared in the registration definition that was assigned, using the values provided on the `authorizations` array of the definition configuration. 
- If there are eligible authorizations defined as part of the registration definition properties, these configurations are configured on the Microsoft Entra Privileged Identity Management (PIM) service.

### During off-boarding
The steps on the on-boarding process are rolled back.
