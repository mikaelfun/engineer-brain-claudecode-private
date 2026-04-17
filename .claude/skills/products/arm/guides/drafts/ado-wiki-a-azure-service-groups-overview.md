---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Service Groups/Overview"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Service%20Groups%2FOverview"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## What is Azure Service Groups?
Azure Service Groups offer a flexible way to organize and manage resources across subscriptions and resource groups, parallel to any existing Azure resource hierarchy. They are ideal for scenarios requiring cross-boundary grouping, minimal permissions, and aggregations of data across resources. These features empower teams to create tailored resource collections that align with operational, organizational, or persona-based needs.

Within the hierarchy of resources, there is a limitation of one parent resource container to many children. For example, a resource can only be a member of one resource group or a resource group can only be a member of one subscription. Service Groups introduce a new model that allows a resources or resource containers to have memberships with multiple different Service Groups. A member is any resource, resource group, or subscription that is connected to a Service Group through a new resource called "ServiceGroupMember" Relationship. The Service Group allows new scenarios where the same resources can be connected to many Service Groups Trees enabling new ways to view your data.

Azure Service Groups are a parallel hierarchy that allows the grouping of resources that do not exist in the resource hierarchy with Resource Groups, Subscriptions, and Management Groups. The separation allows Service Groups to be connected many times to different resources and resource containers without impacting the existing structures.
