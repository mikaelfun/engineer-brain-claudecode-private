---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/Update Service Provider Provisioning State of Circuit"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/Update%20Service%20Provider%20Provisioning%20State%20of%20Circuit"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Update Service Provider Provisioning State of Circuit

[[_TOC_]]

**7/24: This process is officially changing. Please make sure we are following process.**

## Description

This wiki details the process on how to update service provider provisioning state of a ExpressRoute Circuit.

Under the ExpressRoute partner model, customers create ExpressRoute circuits in their Azure subscription and then share the Service Key (S-Key) of the circuit with the selected ExpressRoute Partner. From there, the ExpressRoute partner provisions connectivity and sets the ExpressRoute circuit to a provisioned state.

While the ExpressRoute circuit is in a provisioned state, customers cannot delete the resource. In order to do this, the customer needs to delete any connections to the ExpressRoute circuit and deprovision Microsoft or Private peering. Additionally, the ExpressRoute partner needs to set the state of the ExpressRoute circuit back to NotProvisioned. Please see additional information about how to deprovision an ExpressRoute circuit [here](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-howto-circuit-arm#delete).

Ongoing background operations on your resource may conflict with a deprovisioning request. In such cases, the ExpressRoute circuit service provider status may still reflect as Provisioning or Provisioned on the Azure Portal. If this occurs, you must request your provider to check logs for the deprovisioning request and retry the deprovisioning in case of any "conflict errors." 

If the provider does not see any errors associated with the deprovisioning request, and the circuit service provider status still reflects as Provisioning or Provisioned on the Azure Portal, please raise a Service Request with Azure. For such a request, ensure you include your Provider Service Request Number and the timestamp where they received a successful deprovisioning response from Azure.

## Scenarios 

Typically, we receive manually deprovision requests for the following scenarios:

| Scenario | Connections | Provider Provisioning Status | Manual deprovision | Next Steps Comm to Cx from CSS | CSS actions | Bugfix / Enhancement |
|--|--|--|--|--|--|--|
| 1 |  Remaining |	Provisioned | No | Cx to remove connections, request provider to deprovision, then try delete button on overview page	| Guide Cx on all connections deletion, to retry deprovisioning action by provider if it has failed due to "conflict error" or "remaining connections" | Not a bug, but we are working on introducing a one click delete all connections experience on the portal (No ETA)|
| 2 | Remaining | Not Provisioned |	No | Cx to request provider to provision, remove all connections, request provider to deprovision, then try delete button on overview page | Guide Cx with the actions, please do not manually deprovision Raise an ICM with EROps to involve provider | Discover and fix provider bugs wherein they mark circuit as deprovisioned without receiving success from Azure |
| 3 | Remaining |	Not Provisioned | Yes | The provider deprovisioned the circuit with connections still existing. Microsoft will provision the circuit so the connections can be cleaned up. After we will deprovision so customer can delete circuit. | Post to teams so a TA can manually provision. Once provisioned, guide Cx with removing connections. Reach back out to TA to manually deprovision. | We have a bugfix in place (ETA Sept) so that ckt can't be deprovisioned if any connections remain. This class of cases will then cease to exist.   |
| 4 | Cleaned up | Provisioned | Yes *(1 See Below)* | Cx to request provider to deprovision, then try delete button on overview page| **If Cx can provide proof of provider engagement** *(1 See Below)*, post to teams and TA will provide next steps. **If no proof available**, request them to first go through provider. | Provider to fix bugs where they indicate/share false confirmation with customer without getting success from Azure OR Fix bugs in Azure API or provider portal if any.|

Notes: 

*1*:  If Cx can provide proof of either of the following:
- Provider confirming deprovisioning from their end 
- SR No., timestamp , Provider denying assistance, or no response over multiple follow ups/long timespan 
- Even older providers Cx is not in touch with anymore are required to provide assistance. We require proof of async status/lack of response


~~1. Provider has initiated a deprovision on their end, but it's not reflecting on customer side or Azure.
2. Provider has not or refuses to deprovision the circuit.
3. Circuit is in deprovision state, but customer still has connections or peering on circuit that are not allowing deletion of the circuit.~~


~~If the above scenarios matches your issue please proceed to the next step. If your scenario is not listed, please post to teams and work with a TA to address the issue further.~~

~~## Scenario 1 & 2 Pre-Requisite~~

~~### Step 1~~

~~- Please verify that all options have been exhausted by the customer with the service provider.~~

### Step 2

- You must unlink all virtual networks from private peering on the ExpressRoute circuit before deprovisioning. If this operation fails, check whether any virtual networks are linked to the circuit.

### Step 3

- After all virtual networks have been unlinked, please have the customer delete the private peering connection.~~

### Step 4

- Validate that the Provisioning State is Provisioning or Provisioned from Dump Circuit:
```
SUBSCRIPTION ID: 
SERVICE KEY: 
CIRCUIT NAME: 
CIRCUIT LOCATION: Seattle
GATEWAY MANAGER REGION: West US
GATEWAY MANAGER REGION MONIKER: BY
CIRCUIT SKU: Standard
BANDWIDTH: 1000
BILLING TYPE: MeteredData
ALLOW GLOBAL REACH: False
EXPRESSROUTE DIRECT PORT: N/A
PRIMARY DEVICE: cis-1
SECONDARY DEVICE: cis-2
SERVICE PROVIDER: Provider1
SERVICE PROVIDER TAG(STAG):
PROVISIONING STATE: Provisioned  <--------- Look for Provisioned
CIRCUIT STATE: Enabled
```
### Step 5
Engage TA | Submit Post to ExpressRoute Teams Channel

Please include the following information:
- Scenario/Why the request for manual deprovision.
- Specifically which Circuit you are wanting deprovision:
  - Service Key
  - Service Provider Request Number **(Required)**
  - Dump Circuit Information
  - Dump Routing Information
- Any additional information about why they are asking to deprovision the ExpressRoute circuit.

- If all previous steps have been met/completed, proceed to engage TA via ExpressRoute team

### Solution

TA will review the ask discussed in step 5 and if all steps have been met we will deprovision the circuit. 

~~## Scenario 3 Pre-Requisite~~

### Step 1

- Please validate the circuit is in deprovisioned state and connections/peering still exist. 

### Step 2

Engage TA | Submit Post to ExpressRoute Teams Channel

Please include the following information:
- Specify which connections/peering still exist
- Specifically which Circuit in which they are unable to delete:
  - Service Key
  - Dump Circuit Information
  - Dump Routing Information

### Step 3

TA will provision the circuit back to provisioned state. Once this happens, the customer will be able to remove the peering and connections. 

### Step 4 | Solution

Once the customer has removed the peering/connections, the TA will have to set the provisioned state back to not provisioned before the customer can delete the circuit.


## Possible States of an ExpressRoute Circuit
### 1. NotProvisioned
The ExpressRoute circuit will report the following states at resource creation.
```
ServiceProviderProvisioningState : NotProvisioned
Status                           : Enabled
```
### 2. Provisioning
When the connectivity provider is in the process of provisioning the circuit

The ExpressRoute circuit will report the following states while the connectivity provider is working to provision the circuit.

```
ServiceProviderProvisioningState : Provisioning
Status                           : Enabled
```


### 3. Provisioned
When the connectivity provider has completed the provisioning process

The ExpressRoute circuit will report the following states once the connectivity provider has successfully provisioned the circuit.

```
ServiceProviderProvisioningState : Provisioned
Status                           : Enabled
```

### 4. NotProvisioned
When the connectivity provider is deprovisioning the circuit

If the ExpressRoute circuit needs to be deprovisioned, the circuit will report the following states once the service provider has completed the deprovisioning process.

```
ServiceProviderProvisioningState : NotProvisioned
Status                           : Enabled
```

If any questions about this process, please reach out to @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>. 

# Contributors
 @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>