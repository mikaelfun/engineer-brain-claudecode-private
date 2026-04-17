---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/ARM Platform Core Concepts/ARM resource scopes"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20(ARM)%2FArchitecture%2FARM%20Platform%20Core%20Concepts%2FARM%20resource%20scopes"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Root (/)
The root is also known as the **tenant** scope. It sits above the root management group.

Permissions to the root are required to deploy or create any resources at the `/` scope.

The root cannot be accessed from the Azure Portal, and all interactions to the root must be done through CLI, PowerShell or the REST API.

## Management groups
Management groups were created for users to be able to organize their Azure subscriptions. Management groups can contain either subscriptions or nested management groups.

The first level of the management group hierarchy is called the root management group, and it sits below the root itself (`/`).

## Subscriptions
An Azure subscription serves as a logical container for organizing and controlling access to Azure resources. It provides an access control and billing boundary for the resources it contains.

Subscriptions can contain either resource groups or extension resources.

In the resource hierarchy, a subscription can only be contained inside a single management group. However, subscriptions can exist without management groups if the directory does not make use of this Azure service.

## Resource groups
A resource group is a container that holds related resources for an Azure solution. The resource group can include all the resources for the solution, or only those resources that you want to manage as a group. You decide how you want to allocate resources to resource groups based on what makes the most sense for your organization. Generally, add resources that share the same lifecycle to the same resource group so you can easily deploy, update, and delete them as a group.

In the resource hierarchy, resource groups are the next level below a subscription. They can contain multiple root or extension resources.

## Resources
### Root Resource / Top-Level Resource
A resource with only a single level of nested types (i.e. there's just a single type after the RP namespace). Microsoft.Network/networkSecurityGroups is a top-level resource, whereas Microsoft.Network/networkSecurityGroups/securityRules is not. A common design pattern among RPs is to expose a top-level tracked resource, with nested proxy resources - that way ARM will track the lifecycle of the root resource, but not all of its children. Note however that there is no requirement for a root resource to be tracked.

### Child Resource / Nested Resource
A resource with two or more levels of nested types. Microsoft.Network/networkSecurityGroups/securityRules is a nested resource, whereas Microsoft.Network/networkSecurityGroups is not.

### Extension Resource
An extension resource is a special type of proxy resource that extends or adds capabilities to another resource. For example, a resource lock is an extension resource. You apply a resource lock to another resource to prevent it from being deleted or modified. It does not make sense to create a resource lock by itself. An extension resource is always applied to another resource or resource scope. Another example is role assignments. You can assign a role to a resource. The role assignment is an extension resource type and adds the ability to access the resource.

> Extension resources support being created under resource scopes. However, they may also exist under **any** of the scopes defined above.
