---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Firewall/Azure Firewall Manager"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/pages?pagePath=%2FAzure%20Firewall%2FAzure%20Firewall%20Manager"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# <span style="color:green">Azure Firewall Manager is now in **GENERAL AVAILABILITY**</span>
<span style="color:green">The Azure Networking POD supports Azure Firewall Manager as of 2019-11-04</span>

[[_TOC_]]

https://aka.ms/anpFirewallManagerWiki

# Feature Overview
----

Azure Firewall Manager offers the following:
  - Central Azure Firewall deployment and configuration
  - Hierarchical policies (global and local)
  - Integrated with third-party security-as-a-service for advanced security
  - Centralized route management
  - Centralized security management including Firewall Policies, DDoS Standard Protection Plans, WAF Policies for Application Gateway and Azure Front Door. 

(Excerpt from [What is Azure Firewall Manager Preview?](https://docs.microsoft.com/en-us/azure/firewall-manager/overview))

````
Azure Firewall Manager Preview is a security management service that provides central security policy and route management for cloud-based security perimeters.

Firewall Manager can provide security management for two network architecture types:

- secured virtual hub
An Azure Virtual WAN Hub is a Microsoft-managed resource that lets you easily create hub and spoke architectures. When security and routing policies are associated with such a hub, it is referred to as a secured virtual hub.

- hub virtual network
This is a standard Azure virtual network that you create and manage yourself. When security policies are associated with such a hub, it is referred to as a hub virtual network. At this time, only Azure Firewall Policy is supported. You can peer spoke virtual networks that contain your workload servers and services. You can also manage firewalls in standalone virtual networks that are not peered to any spoke.
````
(Excerpt from [What is Azure Firewall Manager Preview?](https://docs.microsoft.com/en-us/azure/firewall-manager/overview))
<br>
<br>


Also, please review the following Tutorial: 
  - [Tutorial: Secure your hub virtual network using Azure Firewall Manager preview](https://docs.microsoft.com/en-us/azure/firewall-manager/secure-hybrid-network))



## Feature Timeline
----

  - Private Preview: 2019-09-06
  - Public Preview: 2019-11-04
  - Public Preview Refresh: 2020-02-18
  - GA: 2020-06-30
<br>
<br>


## Firewall
----
Refer to the internal [Firewall](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/209908/Azure-Firewall) wiki.
<br>
<br>


## IP Groups
----
Refer to the internal [IP Groups](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/275569/Azure-IP-Groups) wiki.
<br>
<br>


# Case Handling, Teams, Escalation Path
----

## Case Handling
----
The Azure Networking POD (ANP) supports Azure Firewall Manager

**PES ID, Support Topics, Root Cause**
```

  - **PES ID:**
      - PES ID: 16922

  - **Support Topics**
      - Azure Firewall Manager\Configure, Set up, or Manage\Creating a secured virtual Hub
      - Azure Firewall Manager\Configure, Set up, or Manage\Securing an existing virtual WAN Hub
      - Azure Firewall Manager\Configure, Set up, or Manage\Creating an Azure Firewall Policy
      - Azure Firewall Manager\Configure, Set up, or Manage\Third Party Network Security as a Service Integration
      - Azure Firewall Manager\Configure, Set up, or Manage\Associating an Azure Firewall Policy with Virtual Hub
      - Azure Firewall Manager\Configure, Set up, or Manage\Secure Virtual Hub Management
      - Azure Firewall Manager\Configure, Set up, or Manage\Attract Traffic to secure Virtual Hub (Routing)


  - **Root Cause**
      - Updated.

  - ** Scoping Questions **
      - Queued to submit.

  - ** Deflection Content **
      - Queued to submit by Feature PM.
 
```
<br>
<br>



## Teams Channel
----

Use the "Firewall" Teams Channel:
 - ["Firewall" Teams Channel](https://teams.microsoft.com/l/channel/19%3a14c9b83eb8d54c7bb027d2329ed2b1ab%40thread.skype/Firewall?groupId=c3e00ac7-3f76-4350-ba3b-e335a6bbbe21&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

And use these AVA commands:
- ava involve beta
- ava involve pg
<br>
<br>


## Escalation Path
----

The Azure Firewall product team has an excellent method of tracing customer issues.
Whenever a customer performs a PUT or DELETE operation on the firewall that fails unexpectedly, PG catches it with their monitoring system and automatically creates an ICM.
The ICM is uniquely bound to the specific customer / specific firewall.
Such ICM is assigned directly to the Azure Firewall team.

Example: <https://icm.ad.msft.net/imp/v3/incidents/details/99003500/home>

**We encourage Support to research in ICM history and find if an ICM is already opened for the issue. If so, please refrain from opening another ICM to avoid duplicate work.**

The Azure Firewall information is contained in a comment in the ICM (not in the Title nor the description)
In the following format:
*\<subscriptionID\>/\<resource\_group\_name\>/\<azure\_firewall\_name\>*
**  
This sample Kusto query will help find ICMs if already existing for the resource.

    cluster("Icmcluster").database("IcmDataWarehouse").IncidentDescriptions 
    | where Text contains "00000000-0000-0000-0000-000000000000" //the Customer Subscription ID
    | where Text contains "wwdb-usw-fw1" //the Azure Firewall name
    | project Date, IncidentId , ChangedBy, Text

If no existing ICM is found, proceed in opening it if necessary - with TA approval.

<br>


# Known Issues and Limitations
----
Please refer to the "Known Issues" section of our public doc:
[What is Azure Firewall Manager Preview?](https://docs.microsoft.com/en-us/azure/firewall-manager/overview#known-issues)


## No Firewall Deployed

### Issue
The issue occurs when a spoke VNet is peered to a firewall hub. Despite this connection, Firewall Manager incorrectly shows that the spoke VNet is not connected to a firewall when it actually is.

### Cause
This issue arises from an empty Azure Firewall subnet in the spoke VNet or a completely empty VNet with no subnets at all.

### Solution
To resolve this, either delete the empty Azure Firewall subnet in the spoke or add at least one subnet to the spoke VNet. Also ensure that the hub Firewall is actually deployed.

### Note
Although Firewall Manager indicates "no firewall deployed," this is a cosmetic issue, and the spoke VNet maintains its connection to the hub VNet Firewall via UDRs and VNET peering.

### Example
In the images below, the resources depicted include the spoke VNet named `central-us-spoke`, which is peered to the hub VNet `Testing-Hub-CentralUS`, which has a firewall deployed.

*This image shows that Firewall Manager indicates the spoke VNet is not connected to any firewall, even though it is connected to a hub that has a firewall deployed.*
![Firewall Manager shows that spoke has no Firewall](/.attachments/Issue-FWManger.png)

*This image illustrates the spoke VNet displaying a Azure Firewall subnet that is actually empty. This can cause the FW Manager to not correctly detect the HUB Firewall*
![Spoke Shows empty Azure Firewall Subnet when searching spoke VNET](/.attachments/cause-FWManager.png)

*Here, in a seperate scenario the spoke VNet is shown with no subnets. This can also cause the FW Manager to not correctly detect the HUB Firewall*
![A separate condition shows the spoke VNET with no subnets](/.attachments/cause2-FWManager.png)

*This image confirms that the Hub Firewall VNet contains an Azure Firewall subnet, which is expected. (Make sure there is a Firewall deployed)*
![The Hub Firewall VNET has Azure Firewall Subnet as well](/.attachments/FWHUB.png)

*Finally, this image demonstrates that the spoke is correctly connected to a firewall after deleting the empty firewall subnet in the spoke or adding a subnet to an empty spoke VNet.*
![Firewall Manager shows that the spoke now has a Firewall connected via Hub](/.attachments/correct-FWManager.png)

# How It Works and Architecture
----
![Key features information of Azure Firewall Managers](/.attachments/image-6c6262a6-9253-407e-98b0-b3104293fc88.png)

![Firewall Manager Architecture](/.attachments/image-5438a556-8671-42ca-a05c-876a7e5c91f8.png)

![Security features information of Azure Firewall Managers](/.attachments/image-4395495c-fc3c-4d71-a31d-e33a635017a6.png)

![Connectivity and Security Architecture](/.attachments/image-c2845a9b-42e9-46a9-87b2-1f2e0ac2bc33.png)



Azure Firewall Policy exists in a new Resource Provider called NFVRP.
The Azure Firewall instances continue to exist in NRP and refer to the policy object within NFVRP.

![Topology with Azure Firewall Policies](/.attachments/image-7ddb1235-96f4-4601-8637-a9401d0cb4bb.png)


## ARM Namespace and ResourceURI
----

**ARM Namespace**
 
Microsoft.Network/firewallPolicies
<br>
<br>

**ResourceURI**

/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/azfm1rg/providers/Microsoft.Network/firewallPolicies/AzureFirewallManagerPolicy1
<br>
<br>

**ResourceTypes**

azureFirewallFqdnTags
<br>
<br>


## Architecture Diagrams and Component Flow
----


### Azure Firewall Policy - Creation
----

Architecture Diagrams and Component Flow:
> ARM-->NFVRP (Global RP - Policy Stored in CosmosDB)-->CosmosDB
::: mermaid
graph TD;
A(Portal, PowerShell, CLI, Template, REST) -->|Create Azure Firewall Policy| B(ARM);
B --> C(NFVRP - Global RP);
C --> |Policy Stored in CosmosDB |D(CosmosDB);
:::

### Azure Firewall - Creation
----

Architecture Diagrams and Component Flow:
> ARM-->NRP-->GWM-->Azure Firewall Service Instances (VMSS Linux - Regional)
::: mermaid
graph TD
A(Portal, PowerShell, CLI, Template, REST) -->|Create Azure Firewall| B(ARM)
B --> C(NRP - Regional RP)
C --> D(GWM - Regional)
D --> |GWM deploys Azure Firewall Service Instances| E[Azure Firewall Service Instances - VMSS Linux - Regional]
:::


### Azure Firewall Policy Creation + Association with Azure Firewall
----

Architecture Component Flow:
> ARM-->NFVRP-->NRP-->GWM-->Azure Firewall Service Instances - VMSS Linux - Regional)
::: mermaid
graph TD;
A(Portal, PowerShell, CLI, Template, REST) -->|Create Azure Firewall Policy| B(ARM);
B --> C(NFVRP - Global RP);
C -->|Associate Azure Firewall Policy with Azure Firewall with a  Service to Service call | D(NRP - Regional);
D --> E(GWM - Regional);
E --> |GWM deploys Azure Firewall Service Instances - VMSS Linux| F[Azure Firewall Service Instances  - Regional];
:::

<br>
<br>


# How To Deploy and Manage
----
Covering Portal, PowerShell and CLI.


## Portal
----

  - Portal - Search
  - Portal - Azure Firewall Manager
  - Portal - Azure Firewall Policies


### Portal - Search
----

If you navigate and search here:
  - Azure Portal > Search > Firewall

You will see two new objects:
  - Firewall Manager
  - Firewall Policies

![Firewall Manager and Firewall Policies objects](/.attachments/image-07a48e10-26ea-4104-9bc4-3d4cd8bcccc1.png =x150)

During preview the hidekey portal was available through https://aka.ms/firewallmanagerpreview.


### Portal - Azure Firewall Manager
----

This section covers the main portal blades.
<br>
<br>

**Azure Firewall Manager > Getting Started**

This portal blade allows customers to:
  - Create an Azure Firewall Policy
  - Create a Secured Virtual Hub
  - Convert Existing Hubs

![Create an Azure Firewall Policy, Create a Secured Virtual Hub and Convert Existing Hubs](/.attachments/image-f11ab669-5c8d-413a-8dcd-03de2a968b44.png)

**Azure Firewall Manager > Secured Virtual Hubs**

This portal blade allows customers to view the list of Secured Virtual Hubs, create new secured virtual hubs, and convert existing hubs.

![List of Secured Virtual Hubs](/.attachments/image-2cb6c654-2e32-4875-9b0f-c86f1c088cb0.png)


**Azure Firewall Manager > Azure Firewall Policies**

This portal blade allows customers to:
  - View the list of Azure Firewall Policies
  - Create new policies
  - Associate/Disassociate Hubs 
  - Delete policies

![List of Azure Firewall Policies](/.attachments/image-db73511e-3b0f-4338-aea5-d1bcc6d9bfb9.png)

### Firewall Manager: How To Remove VNet Associations
----

Step 1:<br>
> ![Select a Firewall Policy and Remove VNet associations option](/.attachments/image-7d64af3f-4033-48ea-a734-64c9dd25be43.png)

Step 2:<br>
> ![Confirm button on Remove associations warning message](/.attachments/image-e5ac79ea-e227-4a19-a038-060835d60a85.png)

**Azure Firewall Manager > Trusted Security Partners**

This portal blade allows customers to:
  - View Trusted Security Partners with their associations to Hubs.
![Trusted Security Partners Option](/.attachments/image-68795b3c-2f56-4c45-b1bb-580863bff39b.png)

<br>
<br>

### Portal - Azure Firewall Policies
----

This portal blade allows customers to:
  - View the list of Firewall Policies
  - Create, Manage, and Delete Firewall Policies
![List of Azure Firewall Policies](/.attachments/image-0de52071-7f69-48fc-864b-5a9457ec6bff.png)



## PowerShell
----


### List Azure Firewall Policy Cmdlets
----

```
PS C:\> get-command *AzFirewallPolicy*                                                                                   
CommandType     Name                                               Version    Source
-----------     ----                                               -------    ------
Cmdlet          Get-AzFirewallPolicy                               2.0.0      Az.Network
Cmdlet          Get-AzFirewallPolicyRuleCollectionGroup            2.0.0      Az.Network
Cmdlet          New-AzFirewallPolicy                               2.0.0      Az.Network
Cmdlet          New-AzFirewallPolicyApplicationRule                2.0.0      Az.Network
Cmdlet          New-AzFirewallPolicyFilterRuleCollection           2.0.0      Az.Network
Cmdlet          New-AzFirewallPolicyNatRuleCollection              2.0.0      Az.Network
Cmdlet          New-AzFirewallPolicyNetworkRule                    2.0.0      Az.Network
Cmdlet          New-AzFirewallPolicyRuleCollectionGroup            2.0.0      Az.Network
Cmdlet          Remove-AzFirewallPolicy                            2.0.0      Az.Network
Cmdlet          Remove-AzFirewallPolicyRuleCollectionGroup         2.0.0      Az.Network
Cmdlet          Set-AzFirewallPolicy                               2.0.0      Az.Network
Cmdlet          Set-AzFirewallPolicyRuleCollectionGroup            2.0.0      Az.Network
```
<br>
<br>


## CLI
----

### Install the Azure-Firewall Extension
----

Add the extension for "azure-firewall".

```
PS C:\> az extension add --name azure-firewall
 - Installing ..
```

```
PS C:\> az extension add --name azure-firewall
The installed extension 'azure-firewall' is in preview.
```
<br>
<br>

### List Az commands for Firewall Policy
----

```
PS C:\> az network firewall policy -h

Group
    az network firewall policy : Manage and configure Azure firewall policy.
        This command group is in preview. It may be changed/removed in a future release.
Subgroups:
    rule-collection-group : Manage and configure Azure firewall policy rule collection group.

Commands:
    create                : Create an Azure firewall policy.
    delete                : Delete an Azure firewall policy.
    list                  : List all Azure firewall policies.
    show                  : Show an Azure firewall policy.
    update                : Update an Azure firewall policy.
```

**az network firewall policy update** is used for updating the below arguments of the AzFW 

```
az network firewall policy update --name
                                  --resource-group
                                  [--add]
                                  [--cert-name]
                                  [--dns-servers]
                                  [--enable-dns-proxy {false, true}]
                                  [--force-string]
                                  [--fqdns]
                                  [--identity]
                                  [--idps-mode {Alert, Deny, Off}]
                                  [--ip-addresses]
                                  [--key-vault-secret-id]
                                  [--remove]
                                  [--set]
                                  [--sku {Premium, Standard}]
                                  [--tags]
                                  [--threat-intel-mode {Alert, Deny, Off}]
```

<br>
<br>
### Manage the Firewall manager's policy "Public Preview"
----

```


- List the configuration for a certain FW manager policy: 
az network firewall policy rule-collection-group list -g ResourceGroupName --policy-name policy1

- Show the configuration for a specific rule collection: 
az network firewall policy rule-collection-group show -g ResourceGroupName --policy-name policy1 -n DefaultNetworkRuleCollectionGroup

- Change the configuration for certain Network/Application/DNAT rule(s),  you need to deal with them as objects : 
az network firewall policy rule-collection-group update -g ResourceGroupName --policy-name policy1 -n DefaultNetworkRuleCollectionGroup --set ruleCollections[0].rules[0].destinationAddresses[0]="10.10.10.10"


```

<br>
<br>

# Troubleshooting and Tools
----

  - Troubleshooting Guides
  - ASC
      - ASC RE
      - ASC Insights
  - Log Sources
      - Jarvis > Actions
      - Jarvis > Logs
      - Jarvis > Dashboard
      - Kusto Query
  - Error Messages
<br>
<br>

## Troubleshooting Guides
----

Work in progress. High-level.  Note: ASC Resource Explorer will be ready by 2019-11-04.

  - Azure Firewall Policy
      - Verify the firewall policy configuration.
          - (This does not show up in "Get NRP Subscription Details", so we are checking on this.)
      - Verify CRUD operations for the policy itself.
          - Use Jarvis>Logs>NFVRP (refer to Log Sources section).
  - Azure Firewall Instance
      - Verify if the Azure Firewall instance configuration references a firewallPolicy.
          - Use Jarvis>Actions>NRP>Get NRP Subscription Details (refer to Log Sources section).
<br>
<br>

## ASC
----

### ASC Resource Explorer
----

The Microsoft.Network/firewallPolicies object has been onboarded to ASC RE.

Properties:
>![Firewall Policy Properties information](/.attachments/image-32c1f208-94bc-4e02-ae13-10c4c681fcf8.png)

Operations:
> ![Firewall Policy NRP Operations results](/.attachments/image-d186b740-9e7e-4b8f-b694-3a3936b86092.png)

<br>
<br>

### ASC Insights
----
ASC Insights working sessions are in flights for AZFW Manager/Policy.

## Log Sources
----

### Jarvis > Actions
----


#### Jarvis > Actions > NFVRP
----

Use Jarvis>Actions>NFVRP to view the reference to the Azure Firewall Policy object from the Azure Firewall instance:
  - [Jarvis>Actions>NFVRP>NFVRP Resource Operations>List Resource Information](https://portal.microsoftgeneva.com/2AD08475?genevatraceguid=f3a9439a-0ccc-447c-a8e0-1e03be2ffdbe)
  - Details
      - NfvRp Resource URI:  /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/azfm1rg/providers/Microsoft.Network/firewallPolicies/AzureFirewallManagerPolicy1
      - NfvRp API: 2019-07-01
      - NfvRp Region: <region>

![NFVRP Filter to show the List Resource Information using Jarvis](/.attachments/image-2a3e7788-cdf7-4367-b768-67de49236cd3.png)

#### Jarvis > Actions > NRP
----

Use Jarvis>Actions>NRP to view the Azure Firewall Policy object itself:
  - [Jarvis>Actions>NRP>NRP Subscription Operations>Get NRP Subscription Details](https://portal.microsoftgeneva.com/78CD3C7F?genevatraceguid=d325a9b3-34d3-43a0-a46b-4cf2b437d976)


The Azure Firewall instance references the firewall policy:
    
```
"metadata": {
      "key": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/AZFM1RG/providers/Microsoft.Network/azureFirewalls/AZUREFIREWALL_AZFM1HUB1",
	... 
    "firewallPolicy": {
      "id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/azfm1rg/providers/Microsoft.Network/firewallPolicies/AzureFirewallManagerPolicy1"
    }
```
<br>
<br>

The Virtual WAN instance refers to the virtualHubs and virtualHubProxies:
    
```
"metadata": {
      "key": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/AZFM1RG/providers/Microsoft.Network/virtualWans/AZFM1VWAN1",
	...
    "virtualHubs": [
      {
        "id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/azfm1rg/providers/Microsoft.Network/virtualHubs/azfm1hub1"
      }
    ],
    "virtualHubProxies": [
      {
	...
        "properties": {
          "provisioningState": "Succeeded",
          "virtualHub": {
            "id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/azfm1rg/providers/Microsoft.Network/virtualHubs/azfm1hub1"
          }
        }
      }
    ],
```
<br>
<br>


The Virtual Hub references the Azure Firewall instance:
    
```
"metadata": {
      "key": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/AZFM1RG/providers/Microsoft.Network/virtualHubs/AZFM1HUB1",
	...
    "azureFirewall": {
      "id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/azfm1rg/providers/Microsoft.Network/azureFirewalls/AzureFirewall_azfm1hub1"
    },
```
<br>
<br>

The VPN Gateway that was deployed:    
```
"metadata": {
      "key": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/AZFM1RG/providers/Microsoft.Network/vpnGateways/AZFM1HUB1_VPNGATEWAY",
```
<br>
<br>


#### Jarvis > Actions > Brooklyn
----

We can also run the Get Azure Firewall action:
  - [Jarvis - Actions - Brooklyn - AzureFirewallOperations - GetAzureFirewall](https://portal.microsoftgeneva.com/FF758297?genevatraceguid=a05b277c-fdbe-4a62-b2d7-eb7440b7fef9)
<br>
<br>

### Jarvis > Logs
----

  - Jarvis>Logs>NFVRP
  - Jarvis>Logs>NRP


#### Jarvis > Logs > NRP
----

  - [Jarvis > Logs > NRP > FrontendOperationEtwEvents](https://portal.microsoftgeneva.com/E32CB603)

<br>
<br>


#### Jarvis > Logs > NFVRP
----

  - [Jarvis > Logs > NFVRP > * ](https://portal.microsoftgeneva.com/257933AC)

<br>
<br>


### Jarvis>Dashboards
----
No Jarvis>Dashboards exist yet for Azure Firewall Manager.  There are no Azure Monitor metrics currently for this product because this is a management feature.
<br>
<br>


### Kusto Queries
----
TBD
<br>
<br>

## Error Messages

### NFVRP Error Messages
  
```
            {
                Code.InternalServerError,
                "Internal Server Error"
            },
            {
                Code.NullResource,
                "NULL resource in the body."
            },
            {
                Code.InvalidLocation,
                "Invalid location. Provided location {0} isn't valid USA location."
            },
            {
                Code.InvalidResourceName,
                "Invalid Resource Name. Provided name {0} does not meet constraints."
            },
            {
                Code.ResourceNotFound,
                "Resource '{0}' was not found."
            },
            {
                Code.InvalidCertName,
                "Invalid cert name {0}."
            },
            {
                Code.InvalidresourceProperty1,
                "Invalid Property1 value {0}."
            },
            {
                Code.AddressPrefixStringCannotBeNullOrEmpty,
                "IP Address Prefix cannot be null or empty."
            },
            {
                Code.InvalidAddressPrefixFormat,
                "IP Prefix {0} is invalid."
            },
            {
                Code.InvalidCIDRNotation,
                "The address prefix {0} in resource {1} has an invalid CIDR notation. For the given prefix length, the address prefix should be {2}."
            },
            {
                Code.InvalidIPAddressFamily,
                "The IPAddress or prefix {0} has invalid address family. Only IPv4 addresses are permitted."
            },
            {
                Code.FirewallPolicyBasePolicyCannotInheritFromAnother,
                "Base Firewall Policy {0} cannot inherit rule groups from another Firewall Policy."
            },
            {
                Code.FirewallPolicyMissingRequiredFeatureAllowCortexSecurity,
                "Subscription '{0}' is missing required feature '{1}' for Cortex Security."
            },
            {
                Code.FirewallPolicyHasAzureFirewallReferences,
                "Firewall Policy '{0}' cannot be deleted since there are Azure Firewalls using this policy."
            },
            {
                Code.FirewallPolicyHasChildPolicyReferences,
                "Firewall Policy '{0}' cannot be deleted since there are other policies that inherit from this policy."
            },
            {
                Code.FirewallPolicyRuleGroupDeleteNotAllowed,
                "Rule Group {0} can not be deleted because Parent Firewall Policy {1} is updating."
            },
            {
                Code.FirewallPolicyRuleGroupInvalidPriorityValue,
                "Invalid Rule Group {0}. Invalid priority value {1}, must be between 100 and 65000"
            },
            {
                Code.FirewallPolicyRuleGroupNamesMustBeUnique,
                "Invalid Firewall Policy {0}. Name {1} used for more than one rule group."
            },
            {
                Code.FirewallPolicyRuleGroupPrioritiesMustBeUnique,
                "Invalid Firewall Policy {0}. Priority {1} used for more than one rule group."
            },
            {
                Code.FirewallPolicyRuleGroupRuleNamesMustBeUnique,
                "Invalid Rule Group {0}. Name {1} used for more than one rule."
            },
            {
                Code.FirewallPolicyRuleGroupRulePrioritiesMustBeUnique,
                "Invalid Rule Group {0}. Priority {1} used for more than one rule."
            },
            {
                Code.FirewallPolicyRuleGroupUpdateNotAllowed,
                "Rule Group {0} can not be updated because Parent Firewall Policy {1} is updating."
            },
            {
                Code.FirewallPolicyRuleAtLeastOneRuleConditionRequired,
                "Invalid Rule {0}. No rule conditions defined"
            },
            {
                Code.FirewallPolicyRuleActionRequired,
                "Invalid Rule [0}. No action defined."
            },
            {
                Code.FirewallPolicyRuleConditionsMustBeOfSameType,
                "Invalid Rule {0}. Cannot include rule conditions of type network and application in the same rule"
            },
            {
                Code.FirewallPolicyRuleConditionNamesMustBeUnique,
                "Invalid Rule {0}. Name {1} used for more than one rule condition"
            },
            {
                Code.FirewallPolicyNatRuleConditionMustBeOfTypeNetwork,
                "Rule Condition for Nat Rule {0} should be of type NetworkRuleCondition"
            },
            {
                Code.FirewallPolicyNatRuleInvalidDnatDestinationAddress,
                "Firewall Policy Nat Rule {0}: Invalid DNat destination address. Multiple values are not supported."
            },
            {
                Code.FirewallPolicyNatRuleInvalidDnatPortOrRangeFormat,
                "Firewall Policy Nat Rule {0}: Invalid DNat port value or range. Multiple values, * and ranges are not supported for DNAT translated port."
            },
            {
                Code.FirewallPolicyNatRuleInvalidIpAddressOrRangeFormat,
                "Firewall Policy Nat Rule {0}: Invalid IP address value or range {1}."
            },
            {
                Code.FirewallPolicyNatRuleIPAddressesAndPortsMustBeSpecified,
                "Firewall Policy Nat Rule {0} should have IP addresses and ports specified."
            },
            {
                Code.FirewallPolicyRuleConditionInvalidIpAddressOrRangeFormat,
                "Firewall Policy Rule Condition {0}: Invalid IP address value or range {1}."
            },
            {
                Code.FirewallPolicyRuleConditionInvalidPortOrRangeFormat,
                "Firewall Policy Rule Condition {0}: Invalid port value or range. User ports must be in [0, 64000]"
            },
            {
                Code.FirewallPolicyRuleConditionIpAddressesAndPortsMustBeSpecified,
                "Firewall Policy Rule Condition {0} should have IP addresses and ports specified. * is used to match all."
            },
            {
                Code.FirewallPolicyApplicationRuleConditionAtLeastOneProtocolRequired,
                "Firewall Policy Application Rule Condition {0} should have atleast one protocol specified."
            },
            {
                Code.FirewallPolicyApplicationRuleConditionHasBothTargetFqdnAndFqdnTags,
                "Firewall Policy Application Rule Condition {0} has both Target Fqdns and FqdnTags"
            },
            {
                Code.FirewallPolicyApplicationRuleConditionInvalidTargetFqdn,
                "Firewall Policy Application Rule Condition {0} has invalid target fqdn {1}"
            },
            {
                Code.FirewallPolicyNetworkRuleConditionAtLeastOneProtocolRequired,
                "Firewall Policy Network Rule Condition {0} should have atleast one protocol specified."
            },
            {
                Code.FirewallPolicyApplicationRuleWithHigherPriority,
                "Invalid Firewall Policy {0}. Application rule {1} in RuleGroup {2} has higher priority than Network rule {3} in RuleGroup {4}."
            },
            {
                Code.FirewallPolicyFilterRuleWithHigherPriority,
                "Invalid Firewall Policy {0}. Filter rule {1} in RuleGroup {2} has higher priority than NAT rule {3} in RuleGroup {4}."
            },
            #region IpGroups
            {
                Code.IpGroupsMissingRequiredFeatureOnSubscription,
                "Subscription '{0}' is missing required feature '{1}' for IpGroups."
            },
            {
                Code.IpGroupsHasResourceReferences,
                "IpGroups '{0}' cannot be deleted since there are other Azure Resources using this resource."
            },
            #endregion

            #region VirtualRouter
            {
                Code.VirtualRouterPeerUpdateNotAllowed,
                "VirtualRouter Peer {0} can not be updated because Parent VirtualRouter {1} is updating."
            },
            {
                Code.VirtualRouterPeerDeleteNotAllowed,
                "VirtualRouter Peer {0} can not be deleted because Parent VirtualRouter {1} is updating."
            }
```


# Public Documentation
----
  - Overview and Technical
    - Overview: [What is Azure Firewall Manager Preview?](https://docs.microsoft.com/en-us/azure/firewall-manager/overview)
    - VWAN: [Tutorial: Secure your virtual WAN using Azure Firewall Manager preview](https://docs.microsoft.com/en-us/azure/firewall-manager/secure-cloud-network)
    - Hub Virtual Networks: [Tutorial: Secure your hub virtual network using Azure Firewall Manager preview](https://docs.microsoft.com/en-us/azure/firewall-manager/secure-hybrid-network)
  - Announcements
      - [Azure Firewall Manager is now in preview](https://azure.microsoft.com/en-us/updates/azure-firewall-manager-is-now-in-preview/)
<br>
<br>


# Training and Other Resources
----

## Feature Overview + Demo (2019-10-31)
----
|[![Azure Firewall Manager Feature Overview and Demo Video](/.attachments/VideoCoverImages/Firewall/FWMOverviewAndDemo.png =480x)](https://microsoft.sharepoint.com/:v:/t/anpreadiness/Ef9QlxUw43VHha0zcdyE6-oBk0iq3pkfJzt883copGes2w?e=KlaC5i)<br><br> _Click on the image to play the video_|
|-|


## Architecture + Jarvis>Actions + Jarvis>Logs (2019-10-31)
----
|[![Azure Firewall Manager ASC RE and Troubleshooting Video](/.attachments/VideoCoverImages/Firewall/FWMTroubleshootingAndASC-RE.png =480x)](https://microsoft.sharepoint.com/:v:/t/anpreadiness/EaEdtMYkSdFGnqte9Z2bZlYBIKUW6prj5Dj6hhbN6jH9WA?e=73YTR9)<br><br> _Click on the image to play the video_|
|-|


# Reporting
----

## P360 - Azure Firewall Manager
----

  - [Azure Firewall Manager](https://product360.msftcloudes.com/product/1277/domain/Support?period=Week&meter=Microsoft.Cloud.P360.SupportDomain.Production.OverallCustomerScore_581179&tab=%7B%22tabId%22:%22Summary%22,%22subtabId%22:null%7D)
      - P360 / Support / P=Azure Firewall Manager / Weekly
<br>
<br>

